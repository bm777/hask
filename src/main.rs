//! Rapid prototyping with Hask
//!
//! Diesel v2 is not an async library, so we have to execute queries in `web::block` closures which
//! offload blocking code (like Diesel's) to a thread-pool in order to not block the server.
//! for Hask use case, storing and cheking in ms is not a big deal, so we can use the blocking code
//! for now. But if you are building a high performance application, we should consider using
//! async Diesel or other async libraries.
//!
#[macro_use]
extern crate diesel;
use actix_web::{error, get, web, middleware, post, App, HttpResponse, HttpServer, Result, Responder};
use qdrant_client::{
    client::QdrantClient, 
    qdrant::{
        PointStruct, vectors_config::Config, ScoredPoint
    }
};
use serde_derive::{Deserialize, Serialize};
use diesel::r2d2::{ConnectionManager, Pool};
use diesel::SqliteConnection;
use dotenvy;
use env_logger;
use shellexpand;
use serde_json::json;
use uuid::Uuid;
use chrono::Local;

mod schema;
mod models;
mod utils;
mod cohere;
mod qdrant;

use crate::cohere::{
    embed::generate_embed,
    rerank::rerank,
    chat::summarize,
    chat::chat,
};
use crate::qdrant::qdrant::{
    check_collection,
    insert_vectors,
    search_points,
};

// Database connection pool -> thoughout teh APP
type DbPool = Pool<ConnectionManager<SqliteConnection>>;

#[derive(Deserialize)]
struct UrlRequest {
    url: String,
}
#[derive(Serialize)]
struct UrlResponse {
    url: String,
    timestamp: String,
    status: String,
}

// serialize of ingest request
#[derive(Deserialize, Debug)]
struct IngestRequest {
    url: String,
    title: String,
    content: String
}
#[derive(Serialize, Debug)]
struct IngestResponse {
    status: String,
    timestamp: String,
}

// serialize of search request
#[derive(Deserialize, Debug)]
struct SearchRequest {
    query: String,
}
#[derive(Serialize, Debug)]
struct SearchResponse {
    context: String,
    urls: Vec<String>,
}

// struct of api key
#[derive(Deserialize, Debug, Clone)]
struct ApiKey {
    key: String,
}
// struct of collection name
#[derive(Deserialize, Debug, Clone)]
struct CollectionName {
    name: String,
}
// struct of number of top results
#[derive(Deserialize, Debug, Clone)]
struct TopResults {
    improved: u64,
    naive: u64,
}
// default route
#[get("/")]
async fn root() -> impl Responder {
    println!("Request received");
    HttpResponse::Ok().body("Welcome to Hask portal!")
}

// save_url fn
// #[post("/url")]
// async fn save_url(
//     pool: web::Data<DbPool>,
//     form: web::Json<models::NewLink>
// ) -> Result::<HttpResponse> {
//     println!("Saving the url: {}...", form.url);
//     let link = web::block(move || {
//         let mut conn = pool.get().expect("couldn't get db connection from pool");
//         utils::store_url(&mut conn, &form.url)
//     })
//     .await?
//     .map_err(error::ErrorInternalServerError)?;

//     Ok(HttpResponse::Created().json(link))
// }

// check_url fn
#[post("/check/url")]
async fn check_url(
    pool: web::Data<DbPool>,
    form: web::Json<models::NewLink>
) -> Result<HttpResponse> {

    let url_clone = form.url.clone(); // clone the url, because we need to move it to the closure :D
    let exists = web::block(move || {
        let mut conn = pool.get().expect("couldn't get db connection from pool"); // or  there might be an issue of sharing the datz over the pool (thread safety)
        utils::is_url_exists(&mut conn, &url_clone)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;
    println!("Url exists: --------> {}", exists);
    let response = UrlResponse {
        url: form.url.clone(),
        timestamp: "random time".to_string(),
        status: if exists { "exists" } else { "not exists" }.to_string(),
    };
    Ok(HttpResponse::Ok().json(response))
}

// indexing pipeline of browser history
// knowledge caming are in the format: (url, title, timestamp, content or chunks)
#[post("/ingest")]
async fn ingest(
    pool: web::Data<DbPool>,
    api: web::Data<ApiKey>,
    col: web::Data<CollectionName>,
    form: web::Json<IngestRequest>
) -> Result<HttpResponse> {
    let client = QdrantClient::from_url("http://localhost:6334").build().unwrap();

    // summarize the content
    let response = summarize(&api.key.to_string(), &form.content)
                    .await
                    .unwrap();
    let summary = response.get("text").unwrap().to_string();
    // println!("Summary: {:?}", summary);

    // generate the embeddings of the summarized content
    let summary = format!("title: {} url: {} xcsummary{}", form.title.clone(), form.url.clone(), summary);
    println!("----->{}", summary);
    let embed = generate_embed(&api.key.to_string(), &vec![summary.clone()])
                    .await
                    .unwrap();
    let array = embed.get("embeddings")
                    .unwrap()
                    .as_array()
                    .unwrap()[0]
                    .as_array()
                    .unwrap();
    // convert Number to f32 array
    let vector: Vec<f32> = array
                            .iter()
                            .map(
                                |x| x.as_f64().unwrap() as f32
                            ).collect();
    // println!("Vector: {:?}", vector);

    // construct the point to be inserted into the collection
    let time = Local::now().to_string();
    let point = PointStruct::new (
        Uuid::new_v4().to_string(), // uuid
        vector.clone(), // vector
        json!({
            "title": form.title.clone(), 
            "url": form.url.clone(), 
            "timestamp": time,
            "page": summary.clone(),
        })
        .try_into()
        .unwrap(),
    );
    // println!("Point: {:?}", point);
    // insert the point into the collection
    let insert = insert_vectors(&client, &col.name.to_string(), &point).await;
    // println!("Insert result: {:?}", insert.unwrap());

    // store the url in the database
    let link = web::block(move || {
        let mut conn = pool.get().expect("couldn't get db connection from pool");
        utils::store_url(&mut conn, &form.url)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;
    println!("Url saved: {:?}", link);


    // return the response
    let response = IngestResponse {
        status: "Ingested".to_string(),
        timestamp: time,
    };
    Ok(HttpResponse::Ok().json(response))
}

// search function: retrieve most relevant visited url to the user query
#[post("/search")]
async fn search(
    pool: web::Data<DbPool>,
    api: web::Data<ApiKey>,
    col: web::Data<CollectionName>,
    top_n: web::Data<TopResults>,
    form: web::Json<SearchRequest>
) -> Result<HttpResponse> {
    let client = QdrantClient::from_url("http://localhost:6334").build().unwrap();

    // searching
    // -----> 3 steps
    // ------------> Step 1: naive search
    // - get embeddings of the user query
    let embed = generate_embed(&api.key.to_string(), &vec![form.query.clone()])
                    .await
                    .unwrap();
    let array = embed.get("embeddings")
                    .unwrap()
                    .as_array()
                    .unwrap()[0]
                    .as_array()
                    .unwrap();
    let vector: Vec<f32> = array
                            .iter()
                            .map(
                                |x| x.as_f64().unwrap() as f32
                            ).collect();

    // - search the collection with the user query (top-n)
    // time will be added later
    let naives_points = search_points(&client, &col.name, &vector, top_n.naive.clone()).await;
    let naives_pages: Vec<Vec<String>> = naives_points
                        .unwrap()
                        .iter()
                        .map(
                            |x|
                           vec![
                                x.payload.get("url").unwrap().to_string(),
                                x.payload.get("page").unwrap().to_string(),
                            ]    
                        ).collect();

    // ------------> Step 2: improved user query -> search + rerank
    // - rephrasing and expansing the user query
    let system_prompt = "Rewrite the following user query into a clear, specific, and
                        formal request suitable for retrieving relevant information from a vector database.";
    let improved_query_result = chat(&api.key.to_string(), &system_prompt.to_string(), &form.query.clone())
                            .await
                            .unwrap();

    let query_text_rewritten = improved_query_result.get("text").unwrap().to_string();
    // println!("-------------Improved query: {}", query_text_rewritten);

    // - get embeddings of the improved user query -> [] -> size = 1
    let embed = generate_embed(&api.key.to_string(), &vec![query_text_rewritten.clone()])
                    .await
                    .unwrap();
    let array = embed.get("embeddings")
                     .unwrap()
                     .as_array()
                     .unwrap()[0]
                     .as_array()
                     .unwrap();
    let vector: Vec<f32> = array
                            .iter()
                            .map(
                                |x| x.as_f64().unwrap() as f32
                            ).collect();

    // println!("Vector of the rewritten query: {:?}", vector);

    // - search the collection with the improved user query (top-5) for each query
    let improved_points = search_points(&client, &col.name, &vector, top_n.improved.clone()).await;
    let improved_pages: Vec<Vec<String>> = improved_points
                        .unwrap()
                        .iter()
                        .map(
                            |x|
                           vec![
                                x.payload.get("url").unwrap().to_string(),
                                x.payload.get("page").unwrap().to_string(),
                            ]    
                        ).collect();

    // - remove duplicate results sub query search
    let mut joined_pages = naives_pages.clone();
    for page in improved_pages {
        if !naives_pages.iter().any(|x| x[0] == page[0]) {
            joined_pages.push(page.clone());
            // println!("+++++++++++++++Added: {}", page[1]);
        }
    }

    // ------------> Step 3: join the results of step 1 and step 2 and rerank -> top-5
    let mut top_pages: Vec<String> = joined_pages.iter().map(|x| x[1].clone()).collect();
    println!("----------Top pages: {:?}", top_pages);
    // feed context + query -> answer(s)
    let response = rerank(&api.key.to_string(), &query_text_rewritten, &top_pages)
                    .await
                    .unwrap();
    let results = response.get("results").unwrap();
    let arr = results.as_array().unwrap();
    println!("arr: {:?}", arr);
    
    let vec_top_3_pages = vec![
        joined_pages[arr[0].get("index").unwrap().as_i64().unwrap() as usize].clone(),
        joined_pages[arr[1].get("index").unwrap().as_i64().unwrap() as usize].clone(),
        joined_pages[arr[2].get("index").unwrap().as_i64().unwrap() as usize].clone(),
    ];
    let top_3_pages: Vec<String> = vec_top_3_pages.iter().map(|x| x[1].clone()).collect();
    let top_3_url: Vec<String> = vec_top_3_pages.iter().map(|x| x[0].clone()).collect();
    println!("-------------Top 3 pages: {:?}", top_3_pages);
    println!("-----------Top 3 urls: {:?}", top_3_url);
    // join pages together into one string
    let context = top_3_pages.join(" ");
    println!("-----------Context: {:?}", context.clone());


    // return the response
    let response = SearchResponse {
        context: context,
        urls: top_3_url,
    };
    Ok(HttpResponse::Ok().json(response))
}





#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // dev mode: environment variables from a .env file
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    let client = QdrantClient::from_url("http://localhost:6334").build().unwrap();
    let top_n = TopResults { naive: 7, improved: 5};

    // create a connection pool
    let pool = init_db_pool();
    utils::create_table(&mut pool.get().expect("couldn't get db connection from pool")).expect("Failed to create table.");

    log::info!("Server running.... -> 1777");

    let api = ApiKey { key: "C6z92rBNOj1oZ28eZmMiLJdn2SKYOh8QNh4aiyP0".to_string() };
    let col = CollectionName { name: "haskk".to_string() };
    // let response = generate_embed(&api.to_string(), &vec!["I ping you!".to_string(), "I try another string".to_string()])
    //                 .await
    //                 .unwrap();  
    // println!("Response: {}", response);

    let _query = "how to write python code?";
    let _docs = vec![
        "it is easy to write python code".to_string(), 
        "I try another letter here, and i love paris".to_string(),
        "I am a software engineer".to_string(),
        "I am a mechanical engineer".to_string(),
        "I am a civil engineer".to_string(),
    ];
    // let response = rerank(
    //             &api.to_string(), 
    //             &query.to_string(),
    //             &docs)
    //             .await
    //             .unwrap();
    // let results = response.get("results").unwrap();
    // let arr = results.as_array().unwrap();
    // let top3pages = vec![
    //     docs[arr[0].get("index").unwrap().as_i64().unwrap() as usize].clone(),
    //     docs[arr[1].get("index").unwrap().as_i64().unwrap() as usize].clone(),
    //     docs[arr[2].get("index").unwrap().as_i64().unwrap() as usize].clone(),
    // ];
    // println!("Response: {}", results);
    // println!("Top 3 pages: {:?}", top3pages);

    let _page = "Fiat money is a type of currency that is not backed by a precious metal, such as gold or silver. 
                It is typically designated by the issuing government to be legal tender, and is authorized by government 
                regulation. Since the end of the Bretton Woods system in 1971, the major currencies in the world are fiat money.
                Fiat money generally does not have intrinsic value and does not have use value. It has value only because the individuals 
                who use it as a unit of account - or, in the case of currency, a medium of exchange - agree on its value.[1] 
                They trust that it will be accepted by merchants and other people as a means of payment for liabilities.";

    // let response = summarize(&api.to_string(), &page.to_string())
    //                 .await
    //                 .unwrap();

    // let summary = response.get("text").unwrap().to_string();

    // println!("Response: {}", response);
    // println!("Summary: {:?}", summary);

    let  _check = check_collection(&client, &384, col.name.clone()).await; // create a collection if it does not exist
    println!("checking collection result: {:?}", _check.unwrap());

    // delete a collection
    // let _ = client.delete_collection(&col).await.unwrap();

    let _vector = generate_embed(&api.key.to_string(), &vec!["I love python".to_string()]).await.unwrap();
    // println!("Vector: {:?}", _vector);
    let _array = _vector.get("embeddings").unwrap().as_array().unwrap()[0].as_array().unwrap();
    // convert Number to f32 array
    let _vector: Vec<f32> = _array.iter().map(
                                    |x| x.as_f64().unwrap() as f32).collect();
    // println!("Vector: {:?}", _vector);

    // upload _docs to the collection
    // for doc in _docs {
    //     let _vector = generate_embed(&api.to_string(), &vec![doc.clone()]).await.unwrap();
    //     let _array = _vector.get("embeddings").unwrap().as_array().unwrap()[0].as_array().unwrap();
    //     let _vector: Vec<f32> = _array.iter().map(|x| x.as_f64().unwrap() as f32).collect();
    //     let point = PointStruct::new (
    //         Uuid::new_v4().to_string(), // uuid
    //         _vector.clone(), // vector
    //         json!({
    //             "title": "title", 
    //             "url": "https://www.google.com", 
    //             "timestamp": "2021-09-01 12:00:00",
    //             "page": doc.clone(),
    //         })
    //         .try_into()
    //         .unwrap(),
    //     );
    //     let _insert = insert_vectors(&client, &col, &point).await;
    //     println!("Insert result: {:?}", _insert);
    // }

    // let point = PointStruct::new (
    //     Uuid::new_v4().to_string(), // uuid
    //     _vector.clone(), // vector
    //     json!({
    //         "title": "I love programming", 
    //         "url": "https://www.google.com", 
    //         "timestamp": "2021-09-01 12:00:00",
    //         "page": _page.clone(),
    //     })
    //     .try_into()
    //     .unwrap(),
    // );

    // println!("Point: {:?}", point);

    // let _insert = insert_vectors(&client, &col, &point).await;
    // println!("Insert result: {:?}", _insert);

    let _search = search_points(&client, &col.name, &_vector, 3).await;
    // let _top3pages: Vec<String> = _search.unwrap().iter().map(|x| x.payload.get("page").unwrap().to_string()).collect();
    let _top3_page_url: Vec<Vec<String>> = _search
                        .unwrap()
                        .iter()
                        .map(
                            |x|
                           vec![
                                x.payload.get("url").unwrap().to_string(),
                                x.payload.get("page").unwrap().to_string(),
                            ]    
                        ).collect();
    println!("Search result: {:?}", _top3_page_url);



    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(api.clone()))
            .app_data(web::Data::new(col.clone()))
            .app_data(web::Data::new(top_n.clone()))
            .wrap(middleware::Logger::default())
            .wrap(middleware::Compress::default())
            .service(root)
            // .service(save_url)
            .service(ingest)
            .service(check_url)
            .service(search)
    })
    .bind(("127.0.0.1", 1777))?
    .run()
    .await
}

fn init_db_pool() -> DbPool {
    let db_path = "~/.hask/hask.db"; // static path
    let conn_str = shellexpand::tilde(db_path).to_string(); // resolve ~ to the home directory
    let manager = ConnectionManager::<SqliteConnection>::new(conn_str);
    Pool::builder()
        .build(manager)
        .expect("Failed to create pool.")
}
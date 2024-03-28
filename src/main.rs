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
use serde_derive::{Deserialize, Serialize};
use diesel::r2d2::{ConnectionManager, Pool};
use diesel::SqliteConnection;
use dotenvy;
use env_logger;

use shellexpand;

mod schema;
mod models;
mod utils;

// Database connection pool -> thoughout teh APP
type DbPool = Pool<ConnectionManager<SqliteConnection>>;

#[derive(Deserialize)]
struct UrlRequest {
    url: String,
}
#[derive(Serialize)]
struct UrlResponse {
    url: String,
    status: String,
}

// default route
#[get("/")]
async fn root() -> impl Responder {
    println!("Request received");
    HttpResponse::Ok().body("Welcome to Hask portal!")
}

// save_url fn
#[post("/url")]
async fn save_url(
    pool: web::Data<DbPool>,
    form: web::Json<models::NewLink>
) -> Result::<HttpResponse> {
    println!("Saving the url: {}...", form.url);
    let link = web::block(move || {
        let mut conn = pool.get().expect("couldn't get db connection from pool");
        utils::store_url(&mut conn, &form.url)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Created().json(link))
}

// check_url fn (to be post)
#[get("/url/{url}")]
async fn check_url(
    pool: web::Data<DbPool>,
    form: web::Path<UrlRequest>
) -> Result<HttpResponse> {
    // println!("Checking if the url exists: {}...", form.url);

    let url_clone = form.url.clone(); // clone the url, because we need to move it to the closure :D
    let exists = web::block(move || {
        let mut conn = pool.get().expect("couldn't get db connection from pool");
        utils::is_url_exists(&mut conn, &url_clone)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    let response = UrlResponse {
        url: form.url.clone(

        ),
        status: if exists { "exists" } else { "not exists" }.to_string(),
    };
    Ok(HttpResponse::Ok().json(response))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // dev mode: environment variables from a .env file
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // create a connection pool
    let pool = init_db_pool();
    utils::create_table(&mut pool.get().expect("couldn't get db connection from pool")).expect("Failed to create table.");

    log::info!("Server running.... -> 1777");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(middleware::Logger::default())
            .service(root)
            .service(save_url)
            .service(check_url)
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
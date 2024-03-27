use actix_web::{get, web, post, App, HttpResponse, HttpServer, Result, Responder};
use serde_derive::{Deserialize, Serialize};


#[derive(Deserialize)]
struct UrlRequest {
    url: String,
}
#[derive(Serialize)]
struct UrlResponse {
    url: String,
    status: String,
}



#[get("/")]
async fn root() -> impl Responder {
    println!("Request received");
    HttpResponse::Ok().body("Welcome to Hask portal!")
}

// save_url fn
#[post("/url")]
async fn save_url(url_request: web::Json<UrlRequest>) -> Result<HttpResponse>  {
    println!("Received url: {}, and start processing it...", url_request.url);
    let response = UrlResponse {
        url: url_request.url.to_string(),
        status: "saved".to_string(),
    };
    Ok(HttpResponse::Ok().json(response))
}
// check_url fn
async fn check_url(info: web::Path<UrlRequest>) -> Result<HttpResponse> {
    println!("Checking if the url exists: {}", info.url);
    let response = UrlResponse {
        url: info.url.to_string(),
        status: "exists".to_string(),
    };
    Ok(HttpResponse::Ok().json(response))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server running.... -> 1777");
    HttpServer::new(|| {
        App::new()
            .service(root)
            .service(save_url)
            .service(check_url)
    })
    .bind(("127.0.0.1", 1777))?
    .run()
    .await
}
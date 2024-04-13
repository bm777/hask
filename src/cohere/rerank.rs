use reqwest::{Client, Error};
use serde_json::{Value, json};
use std::collections::HashMap;


pub async fn rerank(key: &String, query: &String, page: &Vec<String>) -> Result<Value, Error>{
    let client = Client::new();

    let mut params: HashMap<&str, Value> = HashMap::new();

    params.insert("model", "rerank-english-v2.0".into());
    // convert query to value
    params.insert("query", json!(query));
    params.insert("top_n", 3.into()); // default to 5 in production
    params.insert("documents", json!(page));

    let response = client.post("https://api.cohere.ai/v1/rerank")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", key))
        .json(&params)
        .send()
        .await?;

    Ok(response.json().await?)
}
use reqwest::header::{HeaderMap, HeaderValue};
use reqwest::{Client, Error};
use serde_json::{Value, json};
use std::collections::HashMap;


pub async fn generate_embed(key: &String, texts: &Vec<String>) -> Result<Value, Error>{
    let client = Client::new();

    let mut params: HashMap<&str, Value> = HashMap::new();

    params.insert("model", "embed-english-light-v3.0".into());
    params.insert("texts", json!(texts));
    params.insert("input_type", "search_document".into());

    // let json_params = json!(params);

    let response = client.post("https://api.cohere.ai/v1/embed")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", key))
        .json(&params)
        .send()
        .await?;

    Ok(response.json().await?)
}
use reqwest::{Client, Error};
use serde_json::{Value, json};
use std::collections::HashMap;


pub async fn summarize(key: &String, page: &String) -> Result<Value, Error>{
    let client = Client::new();

    let mut params: HashMap<&str, Value> = HashMap::new();

    params.insert("preamble", "Summarize the webpage so that it can be retrieved later.".into());
    params.insert("message", json!(page));

    let response = client.post("https://api.cohere.ai/v1/chat")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", key))
        .json(&params)
        .send()
        .await?;

    Ok(response.json().await?)
}

pub async fn chat(key: &String, preambule: &String, prompt: &String) -> Result<Value, Error>{
    let client = Client::new();

    let mut params: HashMap<&str, Value> = HashMap::new();

    params.insert("preamble", preambule.clone().into());
    params.insert("message", json!(prompt));

    let response = client.post("https://api.cohere.ai/v1/chat")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", key))
        .json(&params)
        .send()
        .await?;

    Ok(response.json().await?)
}
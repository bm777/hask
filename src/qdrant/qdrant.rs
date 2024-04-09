use qdrant_client::{
    client::QdrantClient,
    qdrant::{
        quantization_config::Quantization, vectors_config::Config, CreateCollection, Distance,
        QuantizationConfig, QuantizationType, ScalarQuantization, VectorParams, VectorsConfig,
        PointStruct, SearchPoints, ScoredPoint
    },
};
use anyhow::{Result, Error};
use serde_json::Value;

pub async fn check_collection(client: &QdrantClient, dim: &u64, col: String) -> Result<String>{
    let collections_result = client.list_collections().await.unwrap();

    let collections = collections_result.collections;
    let exists = collections.iter().any(|c| c.name == col);

    if exists {
        // println!("Collection {} exists", col);

        Ok("Collection exists".to_string())
    } else {
        // println!("Collection {} does not exist, creating...", col);
        client
        .create_collection(&CreateCollection {
            collection_name: col.clone().into(),
            vectors_config: Some(VectorsConfig {
                config: Some(Config::Params(VectorParams {
                    size: dim.clone(),
                    distance: Distance::Cosine.into(),
                    ..Default::default()
                })),
            }),
            quantization_config: Some(QuantizationConfig {
                quantization: Some(Quantization::Scalar(ScalarQuantization {
                    r#type: QuantizationType::Int8.into(),
                    quantile: Some(0.99),
                    always_ram: Some(true),
                })),
            }),    
            ..Default::default()
        })
        .await?;

        Ok("Collection created".to_string())
    }
}

pub async fn search_points(client: &QdrantClient, col: &String, vector: &Vec<f32>, top: u64) -> Result<Vec<ScoredPoint>, Error>{
    let search_result = client
        .search_points(&SearchPoints {
            collection_name: col.clone(),
            vector: vector.clone(),
            limit: top,
            with_payload: Some(true.into()),
            ..Default::default()
        })
        .await
        .unwrap();

    Ok::<Vec<ScoredPoint>, Error>(search_result.result)
}

pub async fn insert_vectors(client: &QdrantClient, col: &String, point: &PointStruct) -> Result<String> {
    let insert_result = client.upsert_points_blocking(
        col.clone(),
        None,
        vec![point.clone()],
        None,
    )
    .await
    .unwrap();

    Ok("Inserted".to_string())
}
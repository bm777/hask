// utils functions
use diesel::SqliteConnection;
use diesel::prelude::*;
use diesel::sql_query;
use uuid::Uuid;
use chrono::Local;

use crate::models;

type DbError = Box<dyn std::error::Error + Send + Sync>; // share data between different threads

// store url in the database
pub fn store_url(
    conn: &mut SqliteConnection,
    _url: &str, //// prevent collision with `url` column imported inside the function
) -> Result<models::Link, DbError> {
    // importing this, to prevent import collition and namespace pullution
    use crate::schema::links::dsl::*;

    let new_link = models::Link {
        id: Uuid::new_v4().to_string(),
        url: _url.to_string(),
        timestamp: Local::now().to_string(),
    };
    diesel::insert_into(links)
        .values(&new_link)
        .execute(conn)?;

    Ok(new_link)
}

// check if the url exists in the database
pub fn is_url_exists(
    conn: &mut SqliteConnection,
    _url: &str, //// prevent collision with `url` column imported inside the function
) -> Result<bool, DbError> {
    use crate::schema::links::dsl::*;

    let result = links
        .filter(url.eq(_url))
        .first::<models::Link>(conn) 
        .optional()?;

    Ok(result.is_some()) // if some ? true : false
}

// create the database table: links
pub fn create_table(conn: &mut SqliteConnection) -> Result<String, DbError> {
    // id is uuid
    sql_query("CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY, 
        url TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )").execute(conn).expect("Error creating links table");

    sql_query("CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY, 
        status TEXT NOT NULL
    )").execute(conn).expect("Error creating history table");

    Ok(format!("Tables created successfully!"))
}
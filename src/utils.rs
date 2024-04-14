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
    _url: &String, //// prevent collision with `url` column imported inside the function
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
    _url: &String, //// prevent collision with `url` column imported inside the function
) -> Result<bool, DbError> {
    use crate::schema::links::dsl::*;

    let result = links
        .filter(url.eq(_url))
        .first::<models::Link>(conn) 
        .optional()?;

    Ok(result.is_some()) // if some ? true : false
}
// check if hisotry is indexed
pub fn is_history_indexed(
    conn: &mut SqliteConnection,
) -> Result<bool, DbError> {
    use crate::schema::history::dsl::*;

    let result = history
        .filter(status.eq("indexed".to_string()))
        .first::<models::History>(conn) 
        .optional()?;

    Ok(result.is_some()) // if some (indexed) ? true : false
}

// update the history status
pub fn update_history_status(
    conn: &mut SqliteConnection,
    _status: &String,
) -> Result<models::History, DbError> {
    use crate::schema::history::dsl::*;

    let result = history
        .filter(status.eq("not indexed".to_string()))
        .first::<models::History>(conn) 
        .optional()?;

    let mut updater = result.unwrap();
    updater.status = "indexed".to_string();

    diesel::update(&updater)
        .set(status.eq(&updater.status))
        .execute(conn)?;

    Ok(updater)
}

// get the hbe status
pub fn get_hbe_status(
    conn: &mut SqliteConnection,
) -> Result<models::Activity, DbError> {
    use crate::schema::activity::dsl::*;

    let result = activity
        .first::<models::Activity>(conn)?;

    Ok(result)
}

// update the hbe status
pub fn update_hbe_status(
    conn: &mut SqliteConnection,
    _status: &String,
) -> Result<models::Activity, DbError> {
    use crate::schema::activity::dsl::*;

    let result = activity
        .first::<models::Activity>(conn)?;

    let mut updater = result;
    updater.status = _status.to_string();

    diesel::update(&updater)
        .set(status.eq(&updater.status))
        .execute(conn)?;

    Ok(updater)
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

    sql_query("CREATE TABLE IF NOT EXISTS activity (
        id TEXT PRIMARY KEY, 
        status TEXT NOT NULL
    )").execute(conn).expect("Error creating activity table");

    // insert the first history
    let new_history = models::History {
        id: Uuid::new_v4().to_string(),
        status: "not indexed".to_string(),
    };
    diesel::insert_into(crate::schema::history::table)
        .values(&new_history)
        .execute(conn)?;

    // insert the first hbe status
    let new_hbe = models::Activity {
        id: Uuid::new_v4().to_string(),
        status: "on".to_string(),
    };
    diesel::insert_into(crate::schema::activity::table)
        .values(&new_hbe)
        .execute(conn)?;

    Ok(format!("Tables created successfully!"))
}
use serde_derive::{Deserialize, Serialize};
use crate::schema::{links, history, activity};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = links)]
pub struct Link {
    pub id: String, // fro the moment, we don't use yet.
    pub url: String,
    pub timestamp: String,
}

// struct for history
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = history)]
pub struct History {
    pub id: String,
    pub status: String,
}

// struct for HBE status -> Activity
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = activity)]
pub struct Activity {
    pub id: String,
    pub status: String,
}

// New url details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewLink {
    pub url: String,
    // pub timestamp: String,
}

// immplementing the NewLink struct
impl NewLink {
    pub fn new(url: impl Into<String>) -> Self {
        Self { 
            url: url.into(),
        }
    }
}
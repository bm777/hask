use serde_derive::{Deserialize, Serialize};

use crate::schema::links;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = links)]
pub struct Link {
    pub id: String,
    pub url: String,
}

// New url details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewLink {
    pub url: String,
}

// immplementing the NewLink struct
impl NewLink {
    pub fn new(url: impl Into<String>) -> Self {
        Self { url: url.into() }
    }
}
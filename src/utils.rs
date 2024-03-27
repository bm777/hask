// utils functions
use serde_derive::{Deserialize, Serialize};
use diesel::prelude::*;
use uuid::Uuid;

use crate::models;

type DbError = Box<dyn std::error::Error + Send + Sync>; // share data between different threads

// store url in the database

// check if the url exists in the database
const path = require("node:path");
const fs = require("node:fs");
const { Client } = require("pg");

const configPath = path.join(__dirname, "database.json");
const config_ = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const key = config_.defaultEnv;
const config = config_[key];

const user = process.env[config.user.ENV];
const host = process.env[config.host.ENV];
const password = process.env[config.password.ENV];
const port = process.env[config.port.ENV];
const dbName = process.env[config.database.ENV];

// bearer:disable javascript_lang_sql_injection
const createDatabase = async (dbName) => {
  const client = new Client({
    user,
    host,
    password,
    port,
  });

  // Regular expression to ensure that dbName contains only valid characters (letters, numbers, underscores)
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error("Invalid database name.");
  }

  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Check if the database exists
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );

    if (res.rowCount === 0) {
      // Create the database if it doesn't exist
      // PostgreSQL does not support parameterized queries for database creation directly
      // but we're validating dbName before the query execution
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (err) {
    console.error("Error creating database", err);
  } finally {
    await client.end();
    console.log("Disconnected from PostgreSQL");
  }
};

createDatabase(dbName);

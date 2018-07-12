# Schema

This document describes our current database schema used in PostgreSQL. 
We use db-migrate to migrate (create tables, add columns etc) the database.  

## Table: _migrations_

Used by db-migrate module to keep track of migrations. 

| NAME        | TYPE      | SIZE        | NULLABLE | COLUMN_DEF                             |
| ----------- | --------- | ----------- | -------- | -------------------------------------- |
| id          | serial    | 10          | 0        | nextval('migrations_id_seq'::regclass) |
| name        | varchar   | 255         | 0        | (null)                                 |
| run_on      | timestamp | 29          | 0        | (null)                                 |

## Table: _events_
| NAME        | TYPE      | SIZE        | NULLABLE | COLUMN_DEF                         |                         
| ----------- | --------- | ----------- | -------- | ---------------------------------- |
| id          | serial    | 10          | 0        | nextval('events_id_seq'::regclass) |
| created_at  | timestamp | 29          | 1        | now()                              |
| type        | varchar   | 255         | 0        | (null)                             |
| created_by  | varchar   | 255         | 0        | (null)                             | 
| data        | json      | 2147483647  | 1        | (null)                             |


## Table: _strategies_
| NAME                | TYPE      | SIZE        | NULLABLE | COLUMN_DEF | 
| ------------------- | --------- | ----------- | -------- | ---------- | 
| created_at          | timestamp | 29          | 1        | now()      | 
| name                | varchar   | 255         | 0        | (null)     | 
| description         | text      | 2147483647  | 1        | (null)     | 
| parameters_template | json      | 2147483647  | 1        | (null)     | 


## Table: _features_

| **NAME**       | **TYPE**      | **SIZE**        | **NULLABLE** | **COLUMN_DEF** | **COMMENT**    |
| -------------  | ---------     | -----------     | ------------ | -------------- | -----------    |
| created_at     | timestamp     | 29              | 1            | now()          |                |
| name           | varchar       | 255             | 0            | (null)         |                |
| enabled        | int4          | 10              | 1            | 0              |                |
| description    | text          | 2147483647      | 1            | (null)         |                |
| archived       | int4          | 10              | 1            | 0              |                |
| strategies     | json          | 2147483647      | 1            | (null)         |                | 


## Table: _client_strategies_

| COLUMN_NAME | TYPE_NAME | COLUMN_SIZE | NULLABLE | COLUMN_DEF | 
| ----------- | --------- | ----------- | -------- | ---------- | 
| app_name    | varchar   | 255         | 0        | (null)     | 
| updated_at  | timestamp | 29          | 1        | now()      | 
| strategies  | json      | 2147483647  | 1        | (null)     |


## Table: _client_instances_

| COLUMN_NAME | TYPE_NAME | COLUMN_SIZE | NULLABLE | COLUMN_DEF |
| ----------- | --------- | ----------- | -------- | ---------- |
| app_name    | varchar   | 255         | 1        | (null)     |
| instance_id | varchar   | 255         | 1        | (null)     |
| client_ip   | varchar   | 255         | 1        | (null)     |
| last_seen   | timestamp | 29          | 1        | now()      |
| created_at  | timestamp | 29          | 1        | now()      |

## Table: _client_metrics_

| COLUMN_NAME | TYPE_NAME | COLUMN_SIZE | NULLABLE | COLUMN_DEF |                                 
| ----------- | --------- | ----------- | -------- | ------------------------------------------ | 
| id          | serial    | 10          | 0        | nextval('client_metrics_id_seq'::regclass) | 
| created_at  | timestamp | 29          | 1        | now() |                                      
| metrics     | json      | 2147483647  | 1        | (null) |                                     

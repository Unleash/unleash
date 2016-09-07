# Schema

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


## Table: _strategies_loc
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

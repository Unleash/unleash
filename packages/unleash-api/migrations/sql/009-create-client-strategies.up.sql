--create new client_strategies table
CREATE TABLE client_strategies (
  app_name varchar(255) PRIMARY KEY NOT NULL,
  r timestamp default now(),
  strategies json
);

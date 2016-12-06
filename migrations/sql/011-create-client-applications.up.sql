CREATE TABLE client_applications (
  app_name varchar(255) PRIMARY KEY NOT NULL,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  description varchar(255),
  icon varchar(255),
  url varchar(255),
  color varchar(255)
);

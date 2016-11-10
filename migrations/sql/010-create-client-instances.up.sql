CREATE TABLE client_instances (
  app_name varchar(255),
  instance_id varchar(255),
  client_ip varchar(255),
  last_seen timestamp default now(),
  created_at timestamp default now()
);

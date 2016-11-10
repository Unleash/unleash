--create new metrics table
CREATE TABLE client_metrics (
  id serial primary key,
  created_at timestamp default now(),
  metrics json
);
CREATE TABLE strategies (
  created_at timestamp default now(),
  name varchar(255) PRIMARY KEY NOT NULL,
  description text
);

CREATE TABLE features (
  created_at timestamp default now(),
  name varchar(255) PRIMARY KEY NOT NULL,
  strategy_name varchar(255) references strategies(name),
  parameters json
);

CREATE TABLE events (
  created_at timestamp default now(),
  type varchar(255) NOT NULL,
  data json
);

--create old columns
ALTER TABLE features ADD "parameters" json;
ALTER TABLE features ADD "strategy_name" varchar(255);

--populate old columns
UPDATE features
SET strategy_name = f.strategies->0->>'name',
   parameters = f.strategies->0->'parameters'
FROM features as f
WHERE f.name = features.name;

--drop new column
ALTER TABLE features DROP COLUMN "strategies";

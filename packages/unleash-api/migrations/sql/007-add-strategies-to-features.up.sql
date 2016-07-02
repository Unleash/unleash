--create new strategies-column
ALTER TABLE features ADD "strategies" json;

--populate the strategies column
UPDATE features
SET strategies = ('[{"name":"'||f.strategy_name||'","parameters":'||f.parameters||'}]')::json
FROM features as f
WHERE f.name = features.name;

--delete old strategy-columns
ALTER TABLE features DROP COLUMN "strategy_name";
ALTER TABLE features DROP COLUMN "parameters";

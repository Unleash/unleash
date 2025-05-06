'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
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
       `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
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
    `,
        callback,
    );
};

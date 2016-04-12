#!/usr/bin/env node

// TODO: move this to somewhere internal

var builder = require('xmlbuilder');
var util    = require('util');
var path    = require('path');
var fs      = require('fs');
var sqlRoot = path.resolve(__dirname, '../migrations/sql');
var encoding = 'UTF-8';

var changeLog = builder.create('databaseChangeLog').dec('1.0', encoding);
changeLog.att('xmlns', 'http://www.liquibase.org/xml/ns/dbchangelog');
changeLog.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
changeLog.att('xmlns:ext', 'http://www.liquibase.org/xml/ns/dbchangelog-ext');
changeLog.att('xsi:schemaLocation',
         'http://www.liquibase.org/xml/ns/dbchangelog ' +
         'http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.1.xsd ' +
         'http://www.liquibase.org/xml/ns/dbchangelog-ext ' +
         'http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-ext.xsd');

fs.readdir(sqlRoot, function (err, files) {
    if (err) {
        throw err;
    }

    var changes = {};

    initialInit(changes);

    files.forEach(function (sqlFile) {
        var match = sqlFile.match(/(.+?)\.(up|down)\.sql/);

        if (!match) {
            throw util.format('invalid sql file name, missing up|down: %s', sqlFile);
        }

        var name      = match[1];
        var direction = match[2];

        changes[name]            = changes[name] || {};
        changes[name][direction] = fs.readFileSync(path.resolve(sqlRoot, sqlFile), { encoding: encoding });
    });

    Object.keys(changes).forEach(function (name) {
        var change = changes[name];

        var el = changeLog.ele('changeSet', { id: name, author: 'unleash' });
        el.ele('sql', {}, change.up);
        el.ele('rollback', {}, change.down);
    });

    util.puts(changeLog.end({ pretty: true }));
});

function initialInit(changes) {
    changes["init-prepare"] = {};
    changes["init-prepare"]["up"] = fs.readFileSync(path.resolve(__dirname, './init.up.sql'), { encoding: encoding });
    changes["init-prepare"]["down"] = fs.readFileSync(path.resolve(__dirname, './init.down.sql'), { encoding: encoding });
}


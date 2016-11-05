'use strict';

const express = require('express');
const unleash = require('unleash-client');
const chalk = require('chalk');

const app = express();

const instance = unleash.initialize({
    appName: 'demo-app',
    url: 'http://localhost:4242/',
    refreshIntervall: 4000,
    metricsInterval: 10000,
    strategies: [
        new unleash.Strategy('extra', true),
    ],
});


instance.on('ready', () => {
    console.log('connected to unleash');

    setInterval(() => {
        const result = unleash.isEnabled('add-feature-2', null, Boolean(Math.round(Math.random() * 2)));
        console.log(chalk.yellow('add-feature-2'), chalk.blue(result.toString()));
    }, 1000);
    setInterval(() => {
        const result = unleash.isEnabled('toggle-2', null, Boolean(Math.round(Math.random() * 2)));
        console.log(chalk.green('toggle-2'), chalk.blue(result.toString()));
    }, 1500);
    setInterval(() => {
        const result = unleash.isEnabled('toggle-3', null, Boolean(Math.round(Math.random() * 2)));
        console.log(chalk.red('toggle-3'), chalk.blue(result.toString()));
    }, 1500);
});
instance.on('error', (err) => {
    console.error(err.message, err.stack);
});
instance.on('warn', console.warn);


function outputFeature (name, feature) {
    if (feature.enabled === false) {
        return;
    }
    return `<div>
        <h3>${name}</h3>
        <ul>${feature.strategies.map(strategy => `<li>${strategy.name}:<ul>${
            Object
                .keys(strategy.parameters)
                .map((paramName) => `<li>${paramName}: ${strategy.parameters[paramName]}</li>`)
                .join('')
        }</ul></li>`)}</ul>
    </div>`;
}

app.get('/', (req, res) => {
    const { data } = instance.repository.storage;

    res.send(`<!DOCTYPE html>
        <link rel="stylesheet" href="//static.finncdn.no/bb/css/spaden/5.2.1/spaden.min.css">
        <meta http-equiv="refresh" content="5000">
        <title>Demo example unleash-client usage</title>

        ${
            Object.keys(data)
                .map((key) => outputFeature(key, data[key]))
                .filter(Boolean)
                .join('<hr />')
        }
    `);
});

app.listen(process.env.PORT || 1337);

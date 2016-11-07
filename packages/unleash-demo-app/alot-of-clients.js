'use strict';

const unleash = require('unleash-client');

new Array(1000)
    .join(',')
    .split(',')
    .forEach((v, index) => {
        const instance = new unleash.Unleash({
            appName: `demo-app-${index % 5}`,
            instanceId: `index-${index}`,
            url: 'http://localhost:4242/',
            refreshIntervall: 4000,
            metricsInterval: 10000,
            strategies: [
                new unleash.Strategy('extra', true),
            ],
        });


        instance.on('ready', () => {
            console.log('connected to unleash', index);

            setInterval(() => {
                instance.isEnabled('toggle-1', null, Boolean(Math.round(Math.random() * 2)));
            }, Math.round(Math.random() * 1000));
            setInterval(() => {
                instance.isEnabled('toggle-2', null, Boolean(Math.round(Math.random() * 2)));
            }, 1500);
            setInterval(() => {
                instance.isEnabled('toggle-3', null, Boolean(Math.round(Math.random() * 2)));
            }, 1300);
            setInterval(() => {
                instance.isEnabled('toggle-4', null, Boolean(Math.round(Math.random() * 2)));
            }, 1300);
        });
        instance.on('error', (err) => {
            console.error('index', index, err.message);
        });
        instance.on('warn', console.warn);
    });

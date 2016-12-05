'use strict';

const logger = require('../logger');
const ClientMetrics = require('../client-metrics');
const joi = require('joi');
const { clientMetricsSchema, clientRegisterSchema } = require('./metrics-schema');
const { catchLogAndSendErrorResponse } = require('./route-utils');

module.exports = function (app, config) {
    const {
        clientMetricsStore,
        clientStrategyStore,
        clientInstanceStore,
    } = config.stores;

    const metrics = new ClientMetrics(clientMetricsStore);

    app.get('/client/seen-toggles', (req, res) => {
        const seenAppToggles = metrics.getAppsWithToggles();
        res.json(seenAppToggles);
    });

    app.get('/client/seen-apps/:name', (req, res) => {
        const seenApps = metrics.getAppsFromToggleName(req.params.name);
        res.json(seenApps);
    });

    app.get('/client/metrics/feature-toggles', (req, res) => {
        res.json(metrics.getTogglesMetrics());
    });

    app.get('/client/metrics/feature-toggles/:name', (req, res) => {
        const name = req.params.name;
        const data = metrics.getTogglesMetrics();
        const lastHour = data.lastHour[name] || {};
        const lastMinute = data.lastMinute[name] || {};
        res.json({
            lastHour,
            lastMinute,
        });
    });

    app.post('/client/metrics', (req, res) => {
        const data = req.body;
        const clientIp = req.ip;

        joi.validate(data, clientMetricsSchema, (err, cleaned) => {
            if (err) {
                return res.status(400).json(err);
            }

            clientMetricsStore
                .insert(cleaned)
                .then(() => clientInstanceStore.insert({
                    appName: cleaned.appName,
                    instanceId: cleaned.instanceId,
                    clientIp,
                }))
                .catch(err => logger.error('failed to store metrics', err));

            res.status(202).end();
        });
    });

    app.post('/client/register', (req, res) => {
        const data = req.body;
        const clientIp = req.ip;

        joi.validate(data, clientRegisterSchema, (err, cleaned) => {
            if (err) {
                return res.status(400).json(err);
            }

            clientStrategyStore
                .insert(cleaned.appName, cleaned.strategies)
                .then(() => clientInstanceStore.insert({
                    appName: cleaned.appName,
                    instanceId: cleaned.instanceId,
                    clientIp,
                }))
                .then(() => logger.info(`New client registered with
                            appName=${cleaned.appName} and instanceId=${cleaned.instanceId}`))
                .catch(err => logger.error('failed to register client', err));

            res.status(202).end();
        });
    });

    app.get('/client/strategies', (req, res) => {
        const appName = req.query.appName;
        if (appName) {
            clientStrategyStore.getByAppName(appName)
                .then(data => res.json(data))
                .catch(err => catchLogAndSendErrorResponse(err, res));
        } else {
            clientStrategyStore.getAll()
                .then(data => res.json(data))
                .catch(err => catchLogAndSendErrorResponse(err, res));
        }
    });

    app.get('/client/applications/', (req, res) => {
        clientInstanceStore.getApplications()
            .then(apps => {
                const applications = apps.map(({ appName }) => ({
                    appName,
                    links: {
                        appDetails: `/api/client/applications/${appName}`,
                    },
                }));
                res.json({ applications });
            })
            .catch(err => catchLogAndSendErrorResponse(err, res));
    });

    app.get('/client/applications/:appName', (req, res) => {
        const appName = req.params.appName;
        const seenToggles = metrics.getSeenTogglesByAppName(appName);
        Promise.all([
            clientInstanceStore.getByAppName(appName),
            clientStrategyStore.getByAppName(appName),
        ])
            .then(([instances, strategies]) => res.json({ appName, instances, strategies, seenToggles }))
            .catch(err => catchLogAndSendErrorResponse(err, res));
    });
};

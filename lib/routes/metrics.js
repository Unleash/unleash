'use strict';

const logger = require('../logger');
const ClientMetrics = require('../client-metrics');
const joi = require('joi');
const { clientMetricsSchema, clientRegisterSchema } = require('./metrics-schema');
const { catchLogAndSendErrorResponse } = require('./route-utils');

module.exports = function (app, config) {
    const {
        clientMetricsStore,
        clientInstanceStore,
        clientApplicationsStore,
        strategyStore,
        featureToggleStore,
    } = config.stores;

    const metrics = new ClientMetrics(clientMetricsStore);

    app.get('/client/seen-toggles', (req, res) => {
        const seenAppToggles = metrics.getAppsWithToggles();
        res.json(seenAppToggles);
    });

    app.get('/client/seen-apps', (req, res) => {
        const seenApps = metrics.getSeenAppsPerToggle();
        clientApplicationsStore.getApplications()
            .then(toLookup)
            .then(metaData => {
                Object.keys(seenApps).forEach(key => {
                    seenApps[key] = seenApps[key].map(entry => {
                        if (metaData[entry.appName]) {
                            return Object.assign({}, entry, metaData[entry.appName]);
                        }
                        return entry;
                    });
                });
                res.json(seenApps);
            });
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

        joi.validate(data, clientRegisterSchema, (err, clientRegistration) => {
            if (err) {
                return res.status(400).json(err);
            }

            clientRegistration.clientIp = req.ip;

            clientApplicationsStore
                .upsert(clientRegistration)
                .then(() => clientInstanceStore.insert(clientRegistration))
                .then(() => logger.info(`New client registered with
                            appName=${clientRegistration.appName} and instanceId=${clientRegistration.instanceId}`))
                .catch(err => logger.error('failed to register client', err));

            res.status(202).end();
        });
    });

    app.post('/client/applications/:appName', (req, res) => {
        const input = Object.assign({}, req.body, {
            appName: req.params.appName,
        });
        clientApplicationsStore
            .upsert(input)
            .then(() => res.status(202).end())
            .catch((e) => {
                logger.error(e);
                res.status(500).end();
            });
    });

    function toLookup (metaData) {
        return metaData.reduce((result, entry) => {
            result[entry.appName] = entry;
            return result;
        }, {});
    }

    app.get('/client/applications/', (req, res) => {
        clientApplicationsStore
            .getApplications(req.query)
            .then(applications => res.json({ applications }))
            .catch(err => catchLogAndSendErrorResponse(err, res));
    });

    app.get('/client/applications/:appName', (req, res) => {
        const appName = req.params.appName;
        const seenToggles = metrics.getSeenTogglesByAppName(appName);

        Promise.all([
            clientApplicationsStore.getApplication(appName),
            clientInstanceStore.getByAppName(appName),
            strategyStore.getStrategies(),
            featureToggleStore.getFeatures(),
        ])
        .then(([application, instances, strategies, features]) => {
            const appDetails = {
                appName: application.appName,
                createdAt: application.createdAt,
                description: application.description,
                url: application.url,
                color: application.color,
                icon: application.icon,
                strategies: application.strategies.map(name => {
                    const found = strategies.find((feature) => feature.name === name);
                    if (found) {
                        return found;
                    }
                    return { name, notFound: true  };
                }),
                instances,
                seenToggles: seenToggles.map(name => {
                    const found = features.find((feature) => feature.name === name);
                    if (found) {
                        return found;
                    }
                    return { name, notFound: true };
                }),
                links: {
                    self: `/api/client/applications/${application.appName}`,
                },
            };
            res.json(appDetails);
        })
        .catch(err => catchLogAndSendErrorResponse(err, res));
    });
};

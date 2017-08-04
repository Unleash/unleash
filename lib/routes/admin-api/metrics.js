'use strict';

const { Router } = require('express');

const logger = require('../../logger')('/admin-api/metrics.js');
const ClientMetrics = require('../../client-metrics');
const { catchLogAndSendErrorResponse } = require('./route-utils');

exports.router = function(config) {
    const {
        clientMetricsStore,
        clientInstanceStore,
        clientApplicationsStore,
        strategyStore,
        featureToggleStore,
    } = config.stores;

    const metrics = new ClientMetrics(clientMetricsStore);
    const router = Router();

    router.get('/seen-toggles', (req, res) => {
        const seenAppToggles = metrics.getAppsWithToggles();
        res.json(seenAppToggles);
    });

    router.get('/seen-apps', (req, res) => {
        const seenApps = metrics.getSeenAppsPerToggle();
        clientApplicationsStore
            .getApplications()
            .then(toLookup)
            .then(metaData => {
                Object.keys(seenApps).forEach(key => {
                    seenApps[key] = seenApps[key].map(entry => {
                        if (metaData[entry.appName]) {
                            return Object.assign(
                                {},
                                entry,
                                metaData[entry.appName]
                            );
                        }
                        return entry;
                    });
                });
                res.json(seenApps);
            });
    });

    router.get('/feature-toggles', (req, res) => {
        res.json(metrics.getTogglesMetrics());
    });

    router.get('/feature-toggles/:name', (req, res) => {
        const name = req.params.name;
        const data = metrics.getTogglesMetrics();
        const lastHour = data.lastHour[name] || {};
        const lastMinute = data.lastMinute[name] || {};
        res.json({
            lastHour,
            lastMinute,
        });
    });

    router.post('/applications/:appName', (req, res) => {
        const input = Object.assign({}, req.body, {
            appName: req.params.appName,
        });
        clientApplicationsStore
            .upsert(input)
            .then(() => res.status(202).end())
            .catch(e => {
                logger.error(e);
                res.status(500).end();
            });
    });

    function toLookup(metaData) {
        return metaData.reduce((result, entry) => {
            result[entry.appName] = entry;
            return result;
        }, {});
    }

    router.get('/applications/', (req, res) => {
        clientApplicationsStore
            .getApplications(req.query)
            .then(applications => res.json({ applications }))
            .catch(err => catchLogAndSendErrorResponse(err, res));
    });

    router.get('/applications/:appName', (req, res) => {
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
                        const found = strategies.find(
                            feature => feature.name === name
                        );
                        if (found) {
                            return found;
                        }
                        return { name, notFound: true };
                    }),
                    instances,
                    seenToggles: seenToggles.map(name => {
                        const found = features.find(
                            feature => feature.name === name
                        );
                        if (found) {
                            return found;
                        }
                        return { name, notFound: true };
                    }),
                    links: {
                        self: `/api/applications/${application.appName}`,
                    },
                };
                res.json(appDetails);
            })
            .catch(err => catchLogAndSendErrorResponse(err, res));
    });

    return router;
};

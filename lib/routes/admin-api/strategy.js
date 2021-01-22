'use strict';

const Controller = require('../controller');

const extractUser = require('../../extract-user');
const { handleErrors } = require('./util');
const {
    DELETE_STRATEGY,
    CREATE_STRATEGY,
    UPDATE_STRATEGY,
} = require('../../permissions');

const version = 1;

class StrategyController extends Controller {
    constructor(config, { strategyService }) {
        super(config);
        this.logger = config.getLogger('/admin-api/strategy.js');
        this.strategyService = strategyService;

        this.get('/', this.getAllStratgies);
        this.get('/:name', this.getStrategy);
        this.delete('/:name', this.removeStrategy, DELETE_STRATEGY);
        this.post('/', this.createStrategy, CREATE_STRATEGY);
        this.put('/:strategyName', this.updateStrategy, UPDATE_STRATEGY);
        this.post(
            '/:strategyName/deprecate',
            this.deprecateStrategy,
            UPDATE_STRATEGY,
        );
        this.post(
            '/:strategyName/reactivate',
            this.reactivateStrategy,
            UPDATE_STRATEGY,
        );
    }

    async getAllStratgies(req, res) {
        const strategies = await this.strategyService.getStrategies();
        res.json({ version, strategies });
    }

    async getStrategy(req, res) {
        try {
            const { name } = req.params;
            const strategy = await this.strategyService.getStrategy(name);
            res.json(strategy).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find strategy' });
        }
    }

    async removeStrategy(req, res) {
        const strategyName = req.params.name;
        const userName = extractUser(req);

        try {
            await this.strategyService.removeStrategy(strategyName, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createStrategy(req, res) {
        const userName = extractUser(req);
        try {
            await this.strategyService.createStrategy(req.body, userName);
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateStrategy(req, res) {
        const userName = extractUser(req);
        try {
            await this.strategyService.updateStrategy(req.body, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deprecateStrategy(req, res) {
        const userName = extractUser(req);
        const { strategyName } = req.params;
        if (strategyName === 'default') {
            res.status(403).end();
        } else {
            try {
                await this.strategyService.deprecateStrategy(
                    strategyName,
                    userName,
                );
                res.status(200).end();
            } catch (error) {
                handleErrors(res, this.logger, error);
            }
        }
    }

    async reactivateStrategy(req, res) {
        const userName = extractUser(req);
        const { strategyName } = req.params;
        try {
            await this.strategyService.reactivateStrategy(
                strategyName,
                userName,
            );
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = StrategyController;

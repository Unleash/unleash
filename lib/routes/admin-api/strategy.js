'use strict';

const Controller = require('../controller');
const joi = require('joi');

const eventType = require('../../event-type');
const NameExistsError = require('../../error/name-exists-error');
const extractUser = require('../../extract-user');
const strategySchema = require('./strategy-schema');
const { handleErrors } = require('./util');
const {
    DELETE_STRATEGY,
    CREATE_STRATEGY,
    UPDATE_STRATEGY,
} = require('../../permissions');
const version = 1;

class StrategyController extends Controller {
    constructor(config) {
        super(config);
        this.logger = config.getLogger('/admin-api/strategy.js');
        this.strategyStore = config.stores.strategyStore;
        this.eventStore = config.stores.eventStore;

        this.get('/', this.getAllStratgies);
        this.get('/:name', this.getStrategy);
        this.delete('/:name', this.removeStrategy, DELETE_STRATEGY);
        this.post('/', this.createStrategy, CREATE_STRATEGY);
        this.put('/:strategyName', this.updateStrategy, UPDATE_STRATEGY);
    }

    async getAllStratgies(req, res) {
        const strategies = await this.strategyStore.getStrategies();
        res.json({ version, strategies });
    }

    async getStrategy(req, res) {
        try {
            const name = req.params.name;
            const strategy = await this.strategyStore.getStrategy(name);
            res.json(strategy).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find strategy' });
        }
    }

    async removeStrategy(req, res) {
        const strategyName = req.params.name;

        try {
            const strategy = await this.strategyStore.getStrategy(strategyName);
            await this._validateEditable(strategy);
            await this.eventStore.store({
                type: eventType.STRATEGY_DELETED,
                createdBy: extractUser(req),
                data: {
                    name: strategyName,
                },
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createStrategy(req, res) {
        try {
            const newStrategy = await joi.validate(req.body, strategySchema);
            await this._validateStrategyName(newStrategy);
            await this.eventStore.store({
                type: eventType.STRATEGY_CREATED,
                createdBy: extractUser(req),
                data: newStrategy,
            });
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateStrategy(req, res) {
        const input = req.body;

        try {
            const updatedStrategy = await joi.validate(input, strategySchema);
            const strategy = await this.strategyStore.getStrategy(input.name);
            await this._validateEditable(strategy);

            await this.eventStore.store({
                type: eventType.STRATEGY_UPDATED,
                createdBy: extractUser(req),
                data: updatedStrategy,
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // This check belongs in the store.
    async _validateStrategyName(data) {
        return new Promise((resolve, reject) => {
            this.strategyStore
                .getStrategy(data.name)
                .then(() =>
                    reject(
                        new NameExistsError(
                            `Strategy with name ${data.name} already exist!`
                        )
                    )
                )
                .catch(() => resolve(data));
        });
    }

    // This check belongs in the store.
    _validateEditable(strategy) {
        if (strategy.editable === false) {
            throw new Error(`Cannot edit strategy ${strategy.name}`);
        }
    }
}

module.exports = StrategyController;

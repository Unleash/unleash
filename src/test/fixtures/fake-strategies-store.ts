import {
    IEditableStrategy,
    IMinimalStrategy,
    IStrategy,
    IStrategyStore,
} from '../../lib/types/stores/strategy-store';
import NotFoundError from '../../lib/error/notfound-error';

export default class FakeStrategiesStore implements IStrategyStore {
    defaultStrategy: IStrategy = {
        name: 'default',
        description: 'default strategy',
        displayName: 'Default',
        editable: false,
        parameters: [],
        deprecated: false,
    };

    strategies: IStrategy[] = [this.defaultStrategy];

    async createStrategy(update: IMinimalStrategy): Promise<void> {
        let params;
        if (
            typeof update.parameters === 'string' ||
            typeof update.parameters === 'number'
        ) {
            if (update.parameters === '') {
                params = {};
            } else {
                params = JSON.parse(update.parameters);
            }
        } else {
            params = update.parameters;
        }
        this.strategies.push({
            editable: true,
            deprecated: false,
            description: '',
            displayName: update.name,
            ...update,
            parameters: params,
        });
    }

    async delete(key: string): Promise<void> {
        this.strategies.splice(
            this.strategies.findIndex((k) => k.name === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.strategies = [this.defaultStrategy];
    }

    async deleteStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void> {
        return this.delete(name);
    }

    async deprecateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void> {
        const strategy = await this.get(name);
        strategy.deprecated = true;
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.strategies.some((s) => s.name === key && !s.deprecated);
    }

    async get(key: string): Promise<IStrategy> {
        const strat = this.strategies.find((s) => s.name === key);
        if (strat) {
            return strat;
        }
        throw new NotFoundError(`Could not find strategy with name: ${key}`);
    }

    async getAll(): Promise<IStrategy[]> {
        return this.strategies.filter((s) => !s.deprecated);
    }

    async getEditableStrategies(): Promise<IEditableStrategy[]> {
        return this.strategies
            .filter((s) => s.editable)
            .map((s) => {
                if (!s.parameters) {
                    // eslint-disable-next-line no-param-reassign
                    s.parameters = [];
                }
                return s;
            });
    }

    async getStrategy(name: string): Promise<IStrategy> {
        const strat = this.get(name);
        if (strat) {
            return strat;
        }
        throw new NotFoundError(`Could not find strategy with name: ${name}`);
    }

    async importStrategy(data: IMinimalStrategy): Promise<void> {
        return this.createStrategy(data);
    }

    async reactivateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void> {
        const strategy = await this.get(name);
        strategy.deprecated = false;
        await this.delete(name);
        this.strategies.push(strategy);
    }

    async updateStrategy(update: IMinimalStrategy): Promise<void> {
        await this.delete(update.name);
        return this.createStrategy(update);
    }

    async dropCustomStrategies(): Promise<void> {
        return this.deleteAll();
    }
}

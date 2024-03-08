import { IFeatureToggleClient } from '../types';
import { IClientFeatureToggleReadModel } from './client-feature-toggle-read-model-type';

export default class FakeClientFeatureToggleReadModel
    implements IClientFeatureToggleReadModel
{
    constructor(
        private value: Record<
            string,
            Record<string, IFeatureToggleClient>
        > = {},
    ) {}

    getClient(): Promise<Record<string, Record<string, IFeatureToggleClient>>> {
        return Promise.resolve(this.value);
    }

    setValue(value: Record<string, Record<string, IFeatureToggleClient>>) {
        this.value = value;
    }
}

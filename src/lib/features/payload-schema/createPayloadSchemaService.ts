import type { Db } from '../../db/db.js';
import { FeaturesReadModel } from '../feature-toggle/features-read-model.js';
import { FakeFeaturesReadModel } from '../feature-toggle/fakes/fake-features-read-model.js';
import { PayloadSchemaService } from './payload-schema-service.js';

export const createPayloadSchemaService = (db: Db): PayloadSchemaService => {
    const featuresReadModel = new FeaturesReadModel(db);

    return new PayloadSchemaService({ featuresReadModel });
};

export const createFakePayloadSchemaService = (): PayloadSchemaService => {
    const featuresReadModel = new FakeFeaturesReadModel();

    return new PayloadSchemaService({ featuresReadModel });
};

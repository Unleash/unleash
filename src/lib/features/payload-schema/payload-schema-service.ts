import { NotFoundError } from '../../error/index.js';
import type { IFeaturesReadModel } from '../feature-toggle/types/features-read-model-type.js';
import type { IPayloadSchemaStore } from './payload-schema-store-type.js';
import { validatePayloadSchema } from './payload-schema-validator.js';

interface PayloadSchemaStores {
    featuresReadModel: IFeaturesReadModel;
    payloadSchemaStore: IPayloadSchemaStore;
}

export class PayloadSchemaService {
    private featuresReadModel: IFeaturesReadModel;

    private payloadSchemaStore: IPayloadSchemaStore;

    constructor({
        featuresReadModel,
        payloadSchemaStore,
    }: PayloadSchemaStores) {
        this.featuresReadModel = featuresReadModel;
        this.payloadSchemaStore = payloadSchemaStore;
    }

    async upsertPayloadSchema({
        projectId,
        featureName,
        schema,
    }: {
        projectId: string;
        featureName: string;
        schema: Record<string, unknown>;
    }): Promise<void> {
        const featureExistsInProject =
            await this.featuresReadModel.featureExistsInProject(
                featureName,
                projectId,
            );
        if (!featureExistsInProject) {
            throw new NotFoundError(
                `Could not find feature with name ${featureName} in project ${projectId}`,
            );
        }

        validatePayloadSchema(schema);

        await this.payloadSchemaStore.upsert(featureName, schema);
    }

    async getPayloadSchema(
        featureName: string,
    ): Promise<Record<string, unknown> | undefined> {
        return this.payloadSchemaStore.get(featureName);
    }
}

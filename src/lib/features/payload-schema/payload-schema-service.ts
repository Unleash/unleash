import { NotFoundError } from '../../error/index.js';
import type { IFeaturesReadModel } from '../feature-toggle/types/features-read-model-type.js';
import { validatePayloadSchema } from './payload-schema-validator.js';

interface PayloadSchemaStores {
    featuresReadModel: IFeaturesReadModel;
}

export class PayloadSchemaService {
    private featuresReadModel: IFeaturesReadModel;

    constructor({ featuresReadModel }: PayloadSchemaStores) {
        this.featuresReadModel = featuresReadModel;
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
    }
}

import { BadDataError } from '../../error/index.js';
import type { IStrategyVariant } from '../../types/index.js';
import type { IPayloadSchemaReadModel } from './payload-schema-read-model-type.js';
import { compilePayloadSchema } from './payload-schema-compiler.js';

export type VariantPayload = Pick<IStrategyVariant, 'name' | 'payload'>;

type JsonVariantPayload = VariantPayload & {
    payload: { type: 'json'; value: string };
};

const hasJsonPayload = (
    variant: VariantPayload,
): variant is JsonVariantPayload => variant.payload?.type === 'json';

const parseJsonPayload = (variantName: string, value: string): unknown => {
    try {
        return JSON.parse(value);
    } catch {
        throw new BadDataError(
            `The json payload of variant "${variantName}" is not valid JSON.`,
        );
    }
};

export class VariantPayloadValidator {
    private payloadSchemaReadModel: IPayloadSchemaReadModel;

    constructor(payloadSchemaReadModel: IPayloadSchemaReadModel) {
        this.payloadSchemaReadModel = payloadSchemaReadModel;
    }

    async validateVariants(
        featureName: string,
        variants: VariantPayload[],
    ): Promise<void> {
        const jsonPayloads = variants.filter(hasJsonPayload).map((variant) => ({
            variantName: variant.name,
            payload: parseJsonPayload(variant.name, variant.payload.value),
        }));

        const schema =
            await this.payloadSchemaReadModel.getPayloadSchema(featureName);
        if (!schema) {
            return;
        }
        const payloadMismatch = compilePayloadSchema(schema);

        for (const { variantName, payload } of jsonPayloads) {
            const mismatch = payloadMismatch(payload);
            if (mismatch) {
                throw new BadDataError(
                    `The json payload of variant "${variantName}" does not match the payload schema of feature "${featureName}": ${mismatch}`,
                );
            }
        }
    }
}

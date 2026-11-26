import { BadDataError } from '../../error/index.js';
import type { IStrategyVariant } from '../../types/index.js';
import { hasJsonPayload } from '../feature-toggle/variant-json-payload.js';
import type { IPayloadSchemaReadModel } from './payload-schema-read-model-type.js';
import { compilePayloadSchema } from './payload-schema-compiler.js';

export type VariantPayload = Pick<IStrategyVariant, 'name' | 'payload'>;

export type VariantJsonPayload = {
    variantName: string;
    value: string;
};

export type NonMatchingVariantPayload = VariantJsonPayload & { error: string };

const INVALID_JSON = 'The payload is not valid JSON.';

const parseJson = (value: string): { parsed: unknown } | undefined => {
    try {
        return { parsed: JSON.parse(value) };
    } catch {
        return undefined;
    }
};

export class VariantPayloadValidator {
    private payloadSchemaReadModel: IPayloadSchemaReadModel;

    constructor(payloadSchemaReadModel: IPayloadSchemaReadModel) {
        this.payloadSchemaReadModel = payloadSchemaReadModel;
    }

    static validatePayloadsAgainstSchema(
        schema: Record<string, unknown> | undefined,
        payloads: VariantJsonPayload[],
    ): NonMatchingVariantPayload[] {
        if (payloads.length === 0) {
            return [];
        }
        const payloadMismatch = schema
            ? compilePayloadSchema(schema)
            : () => undefined;

        return payloads.flatMap((payload) => {
            const json = parseJson(payload.value);
            if (!json) {
                return [{ ...payload, error: INVALID_JSON }];
            }
            const error = payloadMismatch(json.parsed);
            return error ? [{ ...payload, error }] : [];
        });
    }

    async validateVariantPayloads(
        featureName: string,
        payloads: VariantJsonPayload[],
    ): Promise<NonMatchingVariantPayload[]> {
        if (payloads.length === 0) {
            return [];
        }

        const schema =
            await this.payloadSchemaReadModel.getPayloadSchema(featureName);
        return VariantPayloadValidator.validatePayloadsAgainstSchema(
            schema,
            payloads,
        );
    }

    async assertVariantsMatchPayloadSchema(
        featureName: string,
        variants: VariantPayload[],
    ): Promise<void> {
        const payloads = variants.filter(hasJsonPayload).map((variant) => ({
            variantName: variant.name,
            value: variant.payload.value,
        }));
        const [firstNonMatching] = await this.validateVariantPayloads(
            featureName,
            payloads,
        );
        if (!firstNonMatching) {
            return;
        }
        const { variantName, error } = firstNonMatching;
        throw new BadDataError(
            error === INVALID_JSON
                ? `The json payload of variant "${variantName}" is not valid JSON.`
                : `The json payload of variant "${variantName}" does not match the payload schema of feature "${featureName}": ${error}`,
        );
    }
}

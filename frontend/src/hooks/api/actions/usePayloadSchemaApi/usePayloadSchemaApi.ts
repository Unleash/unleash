import type {
    ValidateVariantPayloadsSchema,
    VariantPayloadsValidationSchema,
} from 'openapi';
import useAPI from '../useApi/useApi.js';

export type PayloadSchemaTarget = { project: string; feature: string };

type PayloadSchemaApi = {
    upsertPayloadSchema: (schema: unknown) => Promise<void>;
    deletePayloadSchema: () => Promise<void>;
    validateVariantPayloads: (
        payloads: ValidateVariantPayloadsSchema['payloads'],
    ) => Promise<VariantPayloadsValidationSchema['nonMatchingPayloads']>;
};

export function usePayloadSchemaApi(
    target: PayloadSchemaTarget,
): PayloadSchemaApi;
export function usePayloadSchemaApi(
    target?: PayloadSchemaTarget,
): PayloadSchemaApi | undefined;
export function usePayloadSchemaApi(
    target?: PayloadSchemaTarget,
): PayloadSchemaApi | undefined {
    const { makeRequest, createRequest } = useAPI({
        propagateErrors: true,
    });
    if (!target) return undefined;

    const path = `/api/admin/projects/${target.project}/features/${target.feature}/payload-schema`;

    const upsertPayloadSchema = async (schema: unknown) => {
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({ schema }),
        });
        await makeRequest(req.caller, req.id);
    };

    const deletePayloadSchema = async () => {
        const req = createRequest(path, { method: 'DELETE' });
        await makeRequest(req.caller, req.id);
    };

    const validateVariantPayloads = async (
        payloads: ValidateVariantPayloadsSchema['payloads'],
    ): Promise<VariantPayloadsValidationSchema['nonMatchingPayloads']> => {
        const req = createRequest(`${path}/validate-payloads`, {
            method: 'POST',
            body: JSON.stringify({ payloads }),
        });
        const res = await makeRequest(req.caller, req.id);
        const result: VariantPayloadsValidationSchema = await res.json();
        return result.nonMatchingPayloads;
    };

    return {
        upsertPayloadSchema,
        deletePayloadSchema,
        validateVariantPayloads,
    };
}

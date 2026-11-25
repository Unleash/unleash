import type {
    ValidateVariantPayloadsSchema,
    VariantPayloadsValidationSchema,
} from 'openapi';
import useAPI from '../useApi/useApi.js';

export const usePayloadSchemaApi = (projectId: string, featureId: string) => {
    const { makeRequest, createRequest } = useAPI({
        propagateErrors: true,
    });

    const upsertPayloadSchema = async (schema: unknown) => {
        const req = createRequest(
            `/api/admin/projects/${projectId}/features/${featureId}/payload-schema`,
            {
                method: 'PUT',
                body: JSON.stringify({ schema }),
            },
        );
        await makeRequest(req.caller, req.id);
    };

    const deletePayloadSchema = async () => {
        const req = createRequest(
            `/api/admin/projects/${projectId}/features/${featureId}/payload-schema`,
            { method: 'DELETE' },
        );
        await makeRequest(req.caller, req.id);
    };

    const validateVariantPayloads = async (
        payloads: ValidateVariantPayloadsSchema['payloads'],
    ): Promise<VariantPayloadsValidationSchema['nonMatchingPayloads']> => {
        const req = createRequest(
            `/api/admin/projects/${projectId}/features/${featureId}/payload-schema/validate-payloads`,
            {
                method: 'POST',
                body: JSON.stringify({ payloads }),
            },
        );
        const res = await makeRequest(req.caller, req.id);
        const result: VariantPayloadsValidationSchema = await res.json();
        return result.nonMatchingPayloads;
    };

    return {
        upsertPayloadSchema,
        deletePayloadSchema,
        validateVariantPayloads,
    };
};

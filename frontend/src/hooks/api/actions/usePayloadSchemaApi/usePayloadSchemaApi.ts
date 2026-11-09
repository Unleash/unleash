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

    return { upsertPayloadSchema };
};

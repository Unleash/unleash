import { CdnApiTokenSchema } from 'openapi/index.js';
import useAPI from '../useApi/useApi.js';

export const useCdnTokensApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    // const deleteToken = async (secret: string) => {
    //     const path = `api/admin/api-tokens/${secret}`;
    //     const req = createRequest(path, { method: 'DELETE' });

    //     return makeRequest(req.caller, req.id);
    // };

    const createToken = async (newToken: CdnApiTokenSchema) => {
        const path = `api/admin/cdn/tokens`;
        console.log(newToken)
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(newToken),
        });

        return makeRequest(req.caller, req.id);
    };

    return { createToken, errors, loading };
};


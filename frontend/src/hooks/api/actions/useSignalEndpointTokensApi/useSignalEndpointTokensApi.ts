import type { ISignalEndpointToken } from 'interfaces/signal';
import useAPI from '../useApi/useApi.js';

const ENDPOINT = 'api/admin/signal-endpoints';

export type SignalEndpointTokenPayload = Omit<
    ISignalEndpointToken,
    'id' | 'signalEndpointId' | 'createdAt' | 'createdByUserId'
>;

type SignalEndpointTokenWithTokenSecret = ISignalEndpointToken & {
    token: string;
};

export const useSignalEndpointTokensApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addSignalEndpointToken = async (
        signalEndpointId: number,
        signalEndpointToken: SignalEndpointTokenPayload,
    ): Promise<SignalEndpointTokenWithTokenSecret> => {
        const requestId = 'addSignalEndpointToken';
        const req = createRequest(
            `${ENDPOINT}/${signalEndpointId}/tokens`,
            {
                method: 'POST',
                body: JSON.stringify(signalEndpointToken),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateSignalEndpointToken = async (
        signalEndpointId: number,
        signalEndpointTokenId: number,
        signalEndpointToken: SignalEndpointTokenPayload,
    ) => {
        const requestId = 'updateSignalEndpointToken';
        const req = createRequest(
            `${ENDPOINT}/${signalEndpointId}/tokens/${signalEndpointTokenId}`,
            {
                method: 'PUT',
                body: JSON.stringify(signalEndpointToken),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const removeSignalEndpointToken = async (
        signalEndpointId: number,
        signalEndpointTokenId: number,
    ) => {
        const requestId = 'removeSignalEndpointToken';
        const req = createRequest(
            `${ENDPOINT}/${signalEndpointId}/tokens/${signalEndpointTokenId}`,
            { method: 'DELETE' },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addSignalEndpointToken,
        updateSignalEndpointToken,
        removeSignalEndpointToken,
        errors,
        loading,
    };
};

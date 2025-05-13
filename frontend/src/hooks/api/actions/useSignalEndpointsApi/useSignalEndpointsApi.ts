import type { ISignalEndpoint } from 'interfaces/signal';
import useAPI from '../useApi/useApi.js';

const ENDPOINT = 'api/admin/signal-endpoints';

export type SignalEndpointPayload = Omit<
    ISignalEndpoint,
    'id' | 'createdAt' | 'createdByUserId' | 'tokens'
>;

export const useSignalEndpointsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addSignalEndpoint = async (signalEndpoint: SignalEndpointPayload) => {
        const requestId = 'addSignalEndpoint';
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(signalEndpoint),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateSignalEndpoint = async (
        signalEndpointId: number,
        signalEndpoint: SignalEndpointPayload,
    ) => {
        const requestId = 'updateSignalEndpoint';
        const req = createRequest(
            `${ENDPOINT}/${signalEndpointId}`,
            {
                method: 'PUT',
                body: JSON.stringify(signalEndpoint),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const enableSignalEndpoint = async (signalEndpointId: number) => {
        const requestId = 'enableSignalEndpoint';
        const req = createRequest(
            `${ENDPOINT}/${signalEndpointId}/on`,
            {
                method: 'POST',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const disableSignalEndpoint = async (signalEndpointId: number) => {
        const requestId = 'disableSignalEndpoint';
        const req = createRequest(
            `${ENDPOINT}/${signalEndpointId}/off`,
            {
                method: 'POST',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const toggleSignalEndpoint = async (
        signalEndpointId: number,
        enabled: boolean,
    ) => {
        if (enabled) {
            await enableSignalEndpoint(signalEndpointId);
        } else {
            await disableSignalEndpoint(signalEndpointId);
        }
    };

    const removeSignalEndpoint = async (signalEndpointId: number) => {
        const requestId = 'removeSignalEndpoint';
        const req = createRequest(
            `${ENDPOINT}/${signalEndpointId}`,
            { method: 'DELETE' },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addSignalEndpoint,
        updateSignalEndpoint,
        removeSignalEndpoint,
        toggleSignalEndpoint,
        errors,
        loading,
    };
};

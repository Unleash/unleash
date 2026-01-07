import type { IInternalBanner } from 'interfaces/banner';
import useAPI from '../useApi/useApi.js';

const ENDPOINT = 'api/admin/banners';

export type AddOrUpdateBanner = Omit<IInternalBanner, 'id' | 'createdAt'>;

export const useBannersApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addBanner = async (banner: AddOrUpdateBanner) => {
        const requestId = 'addBanner';
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(banner),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateBanner = async (
        bannerId: number,
        banner: AddOrUpdateBanner,
    ) => {
        const requestId = 'updateBanner';
        const req = createRequest(
            `${ENDPOINT}/${bannerId}`,
            {
                method: 'PUT',
                body: JSON.stringify(banner),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const enableBanner = async (bannerId: number) => {
        const requestId = 'enableBanner';
        const req = createRequest(
            `${ENDPOINT}/${bannerId}/on`,
            {
                method: 'POST',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const disableBanner = async (bannerId: number) => {
        const requestId = 'disableBanner';
        const req = createRequest(
            `${ENDPOINT}/${bannerId}/off`,
            {
                method: 'POST',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const toggleBanner = async (bannerId: number, enabled: boolean) => {
        if (enabled) {
            await enableBanner(bannerId);
        } else {
            await disableBanner(bannerId);
        }
    };

    const removeBanner = async (bannerId: number) => {
        const requestId = 'removeBanner';
        const req = createRequest(
            `${ENDPOINT}/${bannerId}`,
            { method: 'DELETE' },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addBanner,
        updateBanner,
        removeBanner,
        toggleBanner,
        errors,
        loading,
    };
};

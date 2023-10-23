import { IInternalBanner } from 'interfaces/banner';
import useAPI from '../useApi/useApi';

const ENDPOINT = 'api/admin/banners';

type AddOrUpdateBanner = Omit<IInternalBanner, 'id' | 'createdAt'>;

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
        errors,
        loading,
    };
};

import { IAddon } from '../../../../interfaces/addons';
import useAPI from '../useApi/useApi';

const useAddonsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = 'api/admin/addons';

    const createAddon = async (addonConfig: IAddon) => {
        const path = URI;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(addonConfig),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const removeAddon = async (id: number) => {
        const path = `${URI}/${id}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });
        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const updateAddon = async (addonConfig: IAddon) => {
        const path = `${URI}/${addonConfig.id}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(addonConfig),
        });
        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return {
        createAddon,
        updateAddon,
        removeAddon,
        errors,
        loading,
    };
};

export default useAddonsApi;

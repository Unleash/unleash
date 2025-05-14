import type { Dispatch, SetStateAction } from 'react';
import useAPI from '../useApi/useApi.js';

export interface ISimpleAuthSettings {
    disabled: boolean;
}

export const handleBadRequest = async (
    setErrors?: Dispatch<SetStateAction<{}>>,
    res?: Response,
) => {
    if (!setErrors) return;
    if (res) {
        const data = await res.json();
        const message = data.details?.[0]?.message ?? data.message;
        setErrors({ message });
        throw new Error(message);
    }

    throw new Error();
};

const useAuthSettingsApi = <T>(id: string) => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
        handleBadRequest,
    });

    const updateSettings = async (settings: T): Promise<void> => {
        const path = `api/admin/auth/${id}/settings`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(settings),
        });

        await makeRequest(req.caller, req.id);
    };

    return { updateSettings, errors, loading };
};

export default useAuthSettingsApi;

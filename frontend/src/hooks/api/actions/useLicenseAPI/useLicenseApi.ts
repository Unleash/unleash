import type { Dispatch, SetStateAction } from 'react';
import useAPI from '../useApi/useApi.js';

export const handleBadRequest = async (
    setErrors?: Dispatch<SetStateAction<{}>>,
    res?: Response,
) => {
    if (!setErrors) return;
    if (res) {
        const data = await res.json();
        setErrors({ message: data.message });
        throw new Error(data.message);
    }

    throw new Error('Did not receive a response from the server.');
};

const useLicenseKeyApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
        handleBadRequest,
    });

    const updateLicenseKey = async (token: string): Promise<void> => {
        const path = `api/admin/license`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ token }),
        });

        await makeRequest(req.caller, req.id);
    };

    return { updateLicenseKey, errors, loading };
};

export default useLicenseKeyApi;

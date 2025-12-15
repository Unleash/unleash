import useAPI from '../useApi/useApi.js';

const useSplashApi = () => {
    const { makeRequest, createRequest } = useAPI({
        propagateErrors: true,
    });

    const setSplashSeen = async (splashId: string) => {
        const path = `api/admin/splash/${splashId}`;
        const req = createRequest(path, {
            method: 'POST',
        });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (_e) {
            console.log('An exception was caught and handled.');
        }
    };

    return {
        setSplashSeen,
    };
};

export default useSplashApi;

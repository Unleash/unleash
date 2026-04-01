import useAPI from '../useApi/useApi.js';

const useInstanceStatusApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const extendTrial = async (): Promise<void> => {
        const path = 'api/instance/extend';
        const req = createRequest(path, { method: 'POST' }, 'extendTrial');
        await makeRequest(req.caller, req.id);
    };

    const setAutoCreateDomainUsers = async (
        enabled: boolean,
    ): Promise<void> => {
        const path = 'api/instance/auto-create-domain-users';
        const req = createRequest(
            path,
            {
                method: 'POST',
                body: JSON.stringify({ enabled }),
            },
            'setAutoCreateDomainUsers',
        );
        await makeRequest(req.caller, req.id);
    };

    return {
        extendTrial,
        setAutoCreateDomainUsers,
        loading,
        errors,
    };
};

export default useInstanceStatusApi;

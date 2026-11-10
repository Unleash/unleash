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

    const setInstanceName = async (name: string): Promise<void> => {
        const path = 'api/instance/name';
        const req = createRequest(
            path,
            {
                method: 'POST',
                body: JSON.stringify({ name }),
            },
            'setInstanceName',
        );
        await makeRequest(req.caller, req.id);
    };

    return {
        extendTrial,
        setAutoCreateDomainUsers,
        setInstanceName,
        loading,
        errors,
    };
};

export default useInstanceStatusApi;

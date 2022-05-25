import useAPI from '../useApi/useApi';

const useInstanceStatusApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const extendTrial = async (): Promise<void> => {
        const path = 'api/instance/extend';
        const req = createRequest(path, { method: 'POST' }, 'extendTrial');
        await makeRequest(req.caller, req.id);
    };

    return {
        extendTrial,
        loading,
        errors,
    };
};

export default useInstanceStatusApi;

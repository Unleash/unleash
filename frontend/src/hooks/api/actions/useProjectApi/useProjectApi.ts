import useAPI from '../useApi/useApi';

const useProjectApi = () => {
    const { makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const deleteProject = async (projectId: string) => {
        const path = `api/admin/projects/${projectId}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return { deleteProject, errors };
};

export default useProjectApi;

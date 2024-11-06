import useAPI from '../useApi/useApi';

export const useReleasePlanTemplatesApi = () => {
    const { makeRequest, makeLightRequest, createRequest, errors, loading } =
        useAPI({
            propagateErrors: true,
        });

    const deleteReleasePlanTemplate = async (id: string) => {
        const path = `api/admin/release-plan-templates/${id}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        deleteReleasePlanTemplate,
    };
};

export default useReleasePlanTemplatesApi;

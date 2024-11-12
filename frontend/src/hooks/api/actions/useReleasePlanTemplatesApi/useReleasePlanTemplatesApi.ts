import type { IReleasePlanTemplatePayload } from 'interfaces/releasePlans';
import useAPI from '../useApi/useApi';

export const useReleasePlanTemplatesApi = () => {
    const { makeRequest, makeLightRequest, createRequest, errors, loading } =
        useAPI({
            propagateErrors: true,
        });

    const deleteReleasePlanTemplate = async (id: string) => {
        const requestId = 'deleteReleasePlanTemplate';
        const path = `api/admin/release-plan-templates/${id}`;
        const req = createRequest(
            path,
            {
                method: 'DELETE',
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    const updateReleasePlanTemplate = async (
        template: IReleasePlanTemplatePayload,
    ) => {
        const requestId = 'updateReleasePlanTemplate';
        const path = `api/admin/release-plan-templates/${template.id}`;
        const req = createRequest(
            path,
            {
                method: 'PUT',
                body: JSON.stringify(template),
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    return {
        deleteReleasePlanTemplate,
        updateReleasePlanTemplate,
    };
};

export default useReleasePlanTemplatesApi;

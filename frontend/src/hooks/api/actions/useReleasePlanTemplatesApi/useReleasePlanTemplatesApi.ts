import type {
    IReleasePlanTemplate,
    IReleasePlanTemplatePayload,
} from 'interfaces/releasePlans';
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

    const createReleasePlanTemplate = async (
        template: IReleasePlanTemplatePayload,
    ): Promise<IReleasePlanTemplate> => {
        const requestId = 'createReleasePlanTemplate';
        const path = 'api/admin/release-plan-templates';
        const req = createRequest(
            path,
            {
                method: 'POST',
                body: JSON.stringify(template),
            },
            requestId,
        );

        const res = await makeRequest(req.caller, req.id);
        return res.json();
    };

    const updateReleasePlanTemplate = async (
        templateId: string,
        template: IReleasePlanTemplatePayload,
    ) => {
        const requestId = 'updateReleasePlanTemplate';
        const path = `api/admin/release-plan-templates/${templateId}`;
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
        createReleasePlanTemplate,
    };
};

export default useReleasePlanTemplatesApi;

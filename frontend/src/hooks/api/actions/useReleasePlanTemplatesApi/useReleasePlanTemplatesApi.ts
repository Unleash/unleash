import type {
    IReleasePlanTemplate,
    IReleasePlanTemplatePayload,
} from 'interfaces/releasePlans';
import { releaseTemplatesApiPath } from '../../getters/useReleasePlanTemplates/releaseTemplatesApiPath.js';
import useAPI from '../useApi/useApi.js';

export const useReleasePlanTemplatesApi = (projectId?: string) => {
    const { makeRequest, createRequest, loading } = useAPI({
        propagateErrors: true,
    });

    const basePath = releaseTemplatesApiPath(projectId);

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
        const req = createRequest(
            basePath,
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
        const path = `${basePath}/${templateId}`;
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

    const archiveReleasePlanTemplate = async (templateId: string) => {
        const requestId = 'updateReleasePlanTemplate';
        const path = `${basePath}/archive/${templateId}`;
        const req = createRequest(
            path,
            {
                method: 'POST',
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    return {
        deleteReleasePlanTemplate,
        updateReleasePlanTemplate,
        createReleasePlanTemplate,
        archiveReleasePlanTemplate,
        loading,
    };
};

export default useReleasePlanTemplatesApi;

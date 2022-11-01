import useAPI from '../useApi/useApi';

export interface ISuggestChangeSchema {
    feature: string;
    action:
        | 'updateEnabled'
        | 'addStrategy'
        | 'updateStrategy'
        | 'deleteStrategy';
    payload: string | boolean | object | number;
}

export const useSuggestChangeApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addSuggestion = async (
        project: string,
        environment: string,
        payload: ISuggestChangeSchema
    ) => {
        const path = `api/admin/projects/${project}/environments/${environment}/suggest-changes`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return response.json();
        } catch (e) {
            throw e;
        }
    };

    const changeState = async (
        project: string,
        suggestChangeId: number,
        payload: any
    ) => {
        const path = `api/admin/projects/${project}/suggest-changes/${suggestChangeId}/state`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return response.json();
        } catch (e) {
            throw e;
        }
    };

    const applyChanges = async (project: string, suggestChangeId: string) => {
        const path = `api/admin/projects/${project}/suggest-changes/${suggestChangeId}/apply`;
        const req = createRequest(path, {
            method: 'PUT',
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return response;
        } catch (e) {
            throw e;
        }
    };

    const discardSuggestions = async (
        project: string,
        changesetId: number,
        changeId: number
    ) => {
        const path = `api/admin/projects/${project}/suggest-changes/${changesetId}/changes/${changeId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });
        try {
            return await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        addSuggestion,
        applyChanges,
        changeState,
        discardSuggestions,
        errors,
        loading,
    };
};

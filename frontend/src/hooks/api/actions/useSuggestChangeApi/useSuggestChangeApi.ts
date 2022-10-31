import useAPI from '../useApi/useApi';

interface ISuggestChangeSchema {
    feature: string;
    action:
        | 'updateEnabled'
        | 'strategyAdd'
        | 'strategyUpdate'
        | 'strategyDelete';
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
            return await response.json();
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
            return await response.json();
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

    return {
        addSuggestion,
        applyChanges,
        changeState,
        errors,
        loading,
    };
};

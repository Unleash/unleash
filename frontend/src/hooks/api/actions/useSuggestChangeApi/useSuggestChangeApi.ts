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

export const useSuggestChangeApi = (project: string) => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addSuggestion = async (
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

    const discardSuggestions = async (
        changesetId: number,
        changeId: number
    ) => {
        const path = `api/admin/projects/${project}/suggest-changes/${changesetId}/changes/${changeId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return await response.json();
        } catch (e) {
            throw e;
        }
    };

    return {
        addSuggestion,
        discardSuggestions,
        errors,
        loading,
    };
};

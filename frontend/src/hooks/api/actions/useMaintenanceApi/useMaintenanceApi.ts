import useAPI from '../useApi/useApi';

export interface IMaintenancePayload {
    enabled: boolean;
}

export const useMaintenanceApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const toggleMaintenance = async (payload: IMaintenancePayload) => {
        const path = `api/admin/maintenance`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };
    return {
        toggleMaintenance,
        errors,
        loading,
    };
};

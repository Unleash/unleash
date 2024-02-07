import useAPI from '../useApi/useApi';

export interface RecordUIErrorSchema {
    errorMessage: string;
    errorStack: string;
}

export const useRecordUIErrorApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const recordUiError = async (
        payload: RecordUIErrorSchema,
    ): Promise<IValidationSchema> => {
        const path = `api/admin/record-ui-error`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const res = await makeRequest(req.caller, req.id);
        return res.json();
    };

    return {
        loading,
        errors,
        recordUiError,
    };
};

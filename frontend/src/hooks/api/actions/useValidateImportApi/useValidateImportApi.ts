import useAPI from '../useApi/useApi';

export interface ImportQuerySchema {
    project: string;
    environment: string;
    data: object;
}
export interface IValidationSchema {
    errors: Array<{ message: string; affectedItems: Array<string> }>;
    warnings: Array<{ message: string; affectedItems: Array<string> }>;
    permissions: Array<{ message: string; affectedItems: Array<string> }>;
}

export const useValidateImportApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const validateImport = async (
        payload: ImportQuerySchema
    ): Promise<IValidationSchema> => {
        const path = `api/admin/features-batch/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res.json();
        } catch (e) {
            throw e;
        }
    };

    return {
        loading,
        errors,
        validateImport,
    };
};

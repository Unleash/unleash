import useAPI from '../useApi/useApi';

// TODO: generate from orval
interface IParentFeaturePayload {
    feature: string;
}
export const useDependentFeaturesApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addDependency = async (
        childFeature: string,
        parentFeaturePayload: IParentFeaturePayload
    ) => {
        const req = createRequest(
            `/api/admin/projects/default/features/${childFeature}/dependencies`,
            {
                method: 'POST',
                body: JSON.stringify(parentFeaturePayload),
            }
        );
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        addDependency,
        errors,
        loading,
    };
};

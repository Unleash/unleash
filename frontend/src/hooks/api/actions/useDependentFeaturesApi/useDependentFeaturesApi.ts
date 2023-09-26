import useAPI from '../useApi/useApi';
import useToast from '../../../useToast';
import { formatUnknownError } from '../../../../utils/formatUnknownError';
import { useCallback } from 'react';

// TODO: generate from orval
interface IParentFeaturePayload {
    feature: string;
}
export const useDependentFeaturesApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const { setToastData, setToastApiError } = useToast();

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

            setToastData({
                title: 'Dependency added',
                type: 'success',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const removeDependency = async (
        childFeature: string,
        parentFeature: string
    ) => {
        const req = createRequest(
            `/api/admin/projects/default/features/${childFeature}/dependencies/${parentFeature}`,
            {
                method: 'DELETE',
            }
        );
        try {
            await makeRequest(req.caller, req.id);

            setToastData({
                title: 'Dependency removed',
                type: 'success',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const removeDependencies = async (childFeature: string) => {
        const req = createRequest(
            `/api/admin/projects/default/features/${childFeature}/dependencies`,
            {
                method: 'DELETE',
            }
        );
        try {
            await makeRequest(req.caller, req.id);

            setToastData({
                title: 'Dependencies removed',
                type: 'success',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const callbackDeps = [
        createRequest,
        makeRequest,
        setToastData,
        formatUnknownError,
    ];
    return {
        addDependency: useCallback(addDependency, callbackDeps),
        removeDependency: useCallback(removeDependency, callbackDeps),
        removeDependencies: useCallback(removeDependencies, callbackDeps),
        errors,
        loading,
    };
};

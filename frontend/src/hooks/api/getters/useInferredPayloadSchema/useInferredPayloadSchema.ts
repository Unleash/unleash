import type { InferredPayloadSchemaSchema } from 'openapi';
import { formatApiPath } from 'utils/formatPath';
import type { RemoteData } from 'hooks/api/RemoteData';
import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';

export type InferredPayloadSchemaState = RemoteData<
    InferredPayloadSchemaSchema['schema']
>;

export const useInferredPayloadSchema = (
    projectId: string,
    featureId: string,
): InferredPayloadSchemaState => {
    const path = formatApiPath(
        `api/admin/projects/${projectId}/features/${featureId}/payload-schema/inferred`,
    );
    const { data, error } = useApiGetter<InferredPayloadSchemaSchema>(
        path,
        () => fetcher(path, 'Inferred payload schema'),
    );

    if (error) {
        return { state: 'error', error };
    }
    if (!data) {
        return { state: 'loading' };
    }
    return { state: 'success', data: data.schema };
};

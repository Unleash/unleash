import type { InferredPayloadSchemaSchema } from 'openapi';
import { formatApiPath } from 'utils/formatPath';
import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';

export type InferredPayloadSchemaState =
    | { status: 'loading' }
    | { status: 'error'; error: Error }
    | { status: 'ready'; schema: InferredPayloadSchemaSchema['schema'] };

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
        return { status: 'error', error };
    }
    if (!data) {
        return { status: 'loading' };
    }
    return { status: 'ready', schema: data.schema };
};

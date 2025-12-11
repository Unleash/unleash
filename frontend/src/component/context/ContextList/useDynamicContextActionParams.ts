import {
    CREATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    UPDATE_PROJECT,
} from '@server/types/permissions';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';

export const useDynamicContextActionParams = (): {
    locations: {
        create: string;
        update: (name: string) => string;
    };
    permissions: {
        create: string;
        delete: string;
        update: string;
    };
} => {
    const projectId = useOptionalPathParam('projectId');

    if (projectId) {
        return {
            locations: {
                create: `/projects/${projectId}/settings/context-fields/create`,
                update: (name: string) =>
                    `/projects/${projectId}/settings/context-fields/edit/${name}`,
            },
            permissions: {
                create: UPDATE_PROJECT,
                delete: UPDATE_PROJECT,
                update: UPDATE_PROJECT,
            },
        };
    }

    return {
        locations: {
            create: '/context/create',
            update: (name: string) => `/context/edit/${name}`,
        },
        permissions: {
            create: CREATE_CONTEXT_FIELD,
            delete: DELETE_CONTEXT_FIELD,
            update: UPDATE_CONTEXT_FIELD,
        },
    };
};

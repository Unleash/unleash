import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import handleErrorResponses from './api/getters/httpErrorResponseHandler';
import { ProjectMode } from 'component/project/Project/hooks/useProjectForm';
import useProject from './api/getters/useProject/useProject';

export interface ISettingsResponse {
    defaultStickiness?: string;
    mode?: ProjectMode;
}
const DEFAULT_STICKINESS = 'default';
export const useDefaultProjectSettings = (projectId: string) => {
    const { uiConfig } = useUiConfig();

    const { projectScopedStickiness } = uiConfig.flags;

    const { project, loading, error } = useProject(projectId);
    return {
        defaultStickiness: Boolean(projectScopedStickiness)
            ? project.defaultStickiness
            : DEFAULT_STICKINESS,
        loading: loading,
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Project stickiness data'))
        .then(res => res.json());
};

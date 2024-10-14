import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type {
    PersonalDashboardSchemaFlagsItem,
    PersonalDashboardSchemaProjectsItem,
} from 'openapi';
import { useEffect } from 'react';

export const useDashboardState = (
    projects: PersonalDashboardSchemaProjectsItem[],
    flags: PersonalDashboardSchemaFlagsItem[],
) => {
    type State = {
        activeProject: string | undefined;
        activeFlag: PersonalDashboardSchemaFlagsItem | undefined;
        expandProjects: boolean;
        expandFlags: boolean;
    };

    const defaultState: State = {
        activeProject: undefined,
        activeFlag: undefined,
        expandProjects: true,
        expandFlags: true,
    };

    const [state, setState] = useLocalStorageState<State>(
        'personal-dashboard:v1',
        defaultState,
    );

    const updateState = (newState: Partial<State>) =>
        setState({ ...defaultState, ...state, ...newState });

    useEffect(() => {
        const updates: Partial<State> = {};
        const setDefaultFlag =
            flags.length &&
            (!state.activeFlag ||
                !flags.some((flag) => flag.name === state.activeFlag?.name));

        if (setDefaultFlag) {
            updates.activeFlag = flags[0];
        }

        const setDefaultProject =
            projects.length &&
            (!state.activeProject ||
                !projects.some(
                    (project) => project.id === state.activeProject,
                ));

        if (setDefaultProject) {
            updates.activeProject = projects[0].id;
        }

        if (Object.keys(updates).length) {
            updateState(updates);
        }
    }, [
        JSON.stringify(projects, null, 2),
        JSON.stringify(flags, null, 2),
        JSON.stringify(state, null, 2),
    ]);

    const { activeFlag, activeProject } = state;

    const setActiveFlag = (flag: PersonalDashboardSchemaFlagsItem) => {
        updateState({
            activeFlag: flag,
        });
    };

    const setActiveProject = (projectId: string) => {
        updateState({
            activeProject: projectId,
        });
    };

    const toggleSectionState = (section: 'flags' | 'projects') => {
        const property = section === 'flags' ? 'expandFlags' : 'expandProjects';
        updateState({
            [property]: !(state[property] ?? true),
        });
    };

    return {
        activeFlag,
        setActiveFlag,
        activeProject,
        setActiveProject,
        expandFlags: state.expandFlags ?? true,
        expandProjects: state.expandProjects ?? true,
        toggleSectionState,
    };
};

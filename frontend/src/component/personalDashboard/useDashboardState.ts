import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type {
    PersonalDashboardSchemaFlagsItem,
    PersonalDashboardSchemaProjectsItem,
} from 'openapi';
import { useEffect } from 'react';

type StateProps = {
    projects?: PersonalDashboardSchemaProjectsItem[];
    flags?: PersonalDashboardSchemaFlagsItem[];
};
export const useDashboardState = (props?: StateProps) => {
    type State = {
        activeProject: string | undefined;
        activeFlag: PersonalDashboardSchemaFlagsItem | undefined;
        expandProjects: boolean;
        expandFlags: boolean;
        expandTimeline: boolean;
    };

    const defaultState: State = {
        activeProject: undefined,
        activeFlag: undefined,
        expandProjects: true,
        expandFlags: true,
        expandTimeline: false,
    };

    const [state, setState] = useLocalStorageState<State>(
        'personal-dashboard:v1',
        defaultState,
    );

    const updateState = (newState: Partial<State>) =>
        setState({ ...defaultState, ...state, ...newState });

    useEffect(() => {
        const updates: Partial<State> = {};

        if (
            props?.flags?.length &&
            (!state.activeFlag ||
                !props.flags.some(
                    (flag) => flag.name === state.activeFlag?.name,
                ))
        ) {
            updates.activeFlag = props.flags[0];
        }

        if (
            props?.projects?.length &&
            (!state.activeProject ||
                !props.projects.some(
                    (project) => project.id === state.activeProject,
                ))
        ) {
            updates.activeProject = props.projects[0].id;
        }

        if (Object.keys(updates).length) {
            updateState(updates);
        }
    }, [JSON.stringify(props), JSON.stringify(state)]);

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

    const toggleSectionState = (section: 'flags' | 'projects' | 'timeline') => {
        const getProperty = () => {
            switch (section) {
                case 'flags':
                    return 'expandFlags';
                case 'projects':
                    return 'expandProjects';
                case 'timeline':
                    return 'expandTimeline';
            }
        };
        const property = getProperty();
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
        expandTimeline: state.expandTimeline ?? false,
        toggleSectionState,
    };
};

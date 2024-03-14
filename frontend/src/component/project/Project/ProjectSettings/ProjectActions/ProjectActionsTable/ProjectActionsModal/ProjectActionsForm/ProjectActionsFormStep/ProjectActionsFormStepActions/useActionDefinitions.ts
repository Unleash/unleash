import { useEffect, useState } from 'react';
import { ActionDefinitionParameter } from '@server/util/constants/action-parameters';
import { ACTIONS, ActionDefinition } from '@server/util/constants/actions';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';

type ActionDefinitionParameterWithOption = ActionDefinitionParameter & {
    options: string[];
};

type ActionDefinitionWithParameterOptions = Omit<
    ActionDefinition,
    'parameters'
> & {
    parameters: ActionDefinitionParameterWithOption[];
};

export type ActionDefinitions = Map<
    string,
    ActionDefinitionWithParameterOptions
>;

export const useActionDefinitions = (projectId: string): ActionDefinitions => {
    const { project, loading: isProjectLoading } =
        useProjectOverview(projectId);
    const { features, loading: isFeaturesLoading } = useFeatureSearch({
        project: `IS:${projectId}`,
    });

    const [actionDefinitions, setActionDefinitions] =
        useState<ActionDefinitions>(new Map());

    useEffect(() => {
        if (isProjectLoading || isFeaturesLoading) return;

        const optionsByType: Record<
            ActionDefinitionParameter['type'],
            string[]
        > = {
            project: [],
            environment: project.environments.map(
                ({ environment }) => environment,
            ),
            featureToggle: features.map(({ name }) => name).sort(),
        };

        const actionDefinitionsWithParameterOptions = new Map<
            string,
            ActionDefinitionWithParameterOptions
        >(
            [...ACTIONS].map(([key, action]) => [
                key,
                {
                    ...action,
                    parameters: action.parameters.map((parameter) => ({
                        ...parameter,
                        options: optionsByType[parameter.type],
                    })),
                },
            ]),
        );

        setActionDefinitions(actionDefinitionsWithParameterOptions);
    }, [projectId, project, features, isProjectLoading, isFeaturesLoading]);

    return actionDefinitions;
};

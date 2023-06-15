import { useMemo } from 'react';
import { List, ListItem, styled, Typography } from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useProject from 'hooks/api/getters/useProject/useProject';
import { IStrategy } from 'interfaces/strategy';
import useUiConfig from '../../../../../hooks/api/getters/useUiConfig/useUiConfig';

interface IFeatureStrategyMenuCardsProps {
    projectId: string;
    featureId: string;
    environmentId: string;
}

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    padding: theme.spacing(1, 2),
}));

export const FeatureStrategyMenuCards = ({
    projectId,
    featureId,
    environmentId,
}: IFeatureStrategyMenuCardsProps) => {
    const { strategies } = useStrategies();
    const { uiConfig } = useUiConfig();

    const preDefinedStrategies = useMemo(() => {
        return strategies.filter(
            strategy => !strategy.deprecated && !strategy.editable
        );
    }, [strategies]);

    const customStrategies = useMemo(() => {
        return strategies.filter(
            strategy => !strategy.deprecated && strategy.editable
        );
    }, [strategies]);

    const { project } = useProject(projectId);

    const strategy = project.environments.find(
        env => env.environment === environmentId
    )?.defaultStrategy;

    const defaultStrategy: IStrategy | undefined = strategy
        ? {
              name: 'flexibleRollout',
              displayName: 'Default strategy',
              description:
                  'This is the default strategy defined for this environment in the project',
              parameters: [],
              editable: false,
              deprecated: false,
          }
        : undefined;

    return (
        <List dense>
            <ConditionallyRender
                condition={
                    uiConfig.flags.strategyImprovements &&
                    defaultStrategy !== undefined
                }
                show={
                    <>
                        <StyledTypography color="textSecondary">
                            {environmentId} environment default strategy
                        </StyledTypography>
                        <ListItem key={strategy!.name}>
                            <FeatureStrategyMenuCard
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={environmentId}
                                strategy={defaultStrategy!}
                                defaultStrategy={true}
                            />
                        </ListItem>
                    </>
                }
            />
            <StyledTypography color="textSecondary">
                Predefined strategy types
            </StyledTypography>
            {preDefinedStrategies.map(strategy => (
                <ListItem key={strategy.name}>
                    <FeatureStrategyMenuCard
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        strategy={strategy}
                    />
                </ListItem>
            ))}
            <ConditionallyRender
                condition={customStrategies.length > 0}
                show={
                    <>
                        <StyledTypography color="textSecondary">
                            Custom strategies
                        </StyledTypography>
                        {customStrategies.map(strategy => (
                            <ListItem key={strategy.name}>
                                <FeatureStrategyMenuCard
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={environmentId}
                                    strategy={strategy}
                                />
                            </ListItem>
                        ))}
                    </>
                }
            />
        </List>
    );
};

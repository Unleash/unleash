import { List, ListItem, styled, Typography } from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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

    const preDefinedStrategies = strategies.filter(
        strategy => !strategy.deprecated && !strategy.editable
    );

    const customStrategies = strategies.filter(
        strategy => !strategy.deprecated && strategy.editable
    );

    const defaultStrategy = {
        name: 'flexibleRollout',
        displayName: 'Default strategy',
        description:
            'This is the default strategy defined for this environment in the project',
    };
    return (
        <List dense>
            <>
                <StyledTypography color="textSecondary">
                    {environmentId} environment default strategy
                </StyledTypography>
                <ListItem key={defaultStrategy.name}>
                    <FeatureStrategyMenuCard
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        strategy={defaultStrategy}
                        defaultStrategy={true}
                    />
                </ListItem>
            </>
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

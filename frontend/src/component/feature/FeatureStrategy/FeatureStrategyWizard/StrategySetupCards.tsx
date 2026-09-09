import { Box, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { formatStrategyName } from 'utils/strategyNames';
import { FeatureStrategyMenuCardIcon } from '../FeatureStrategyMenu/FeatureStrategyMenuCard/FeatureStrategyMenuCardIcon.tsx';
import { useConfigureStrategy } from '../FeatureStrategyMenu/useConfigureStrategy.ts';
import { useProjectDefaultStrategy } from '../FeatureStrategyMenu/useProjectDefaultStrategy.ts';
import { MoreStrategiesMenu } from './MoreStrategiesMenu.tsx';
import { StrategySetupCard } from './StrategySetupCard.tsx';

const MANUAL_STRATEGY = 'flexibleRollout';
const MANUAL_STRATEGY_LABEL = formatStrategyName(MANUAL_STRATEGY);

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 4, 4, 4),
}));

const StyledCardGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: theme.spacing(2),
    width: '100%',
}));

interface IStrategySetupCardsProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    onClose: () => void;
    onShowTemplates: () => void;
}

export const StrategySetupCards = ({
    projectId,
    featureId,
    environmentId,
    onClose,
    onShowTemplates,
}: IStrategySetupCardsProps) => {
    const { isEnterprise } = useUiConfig();
    const { defaultStrategy, applyDefaultStrategy, loading, applying } =
        useProjectDefaultStrategy({
            projectId,
            featureId,
            environmentId,
        });
    const configureStrategy = useConfigureStrategy({
        projectId,
        featureId,
        environmentId,
        onClose,
    });

    const onApplyDefault = async () => {
        if (await applyDefaultStrategy()) {
            onClose();
        }
    };

    return (
        <StyledContainer>
            <StyledCardGrid>
                <StrategySetupCard
                    name='Use project default'
                    description={
                        <>
                            Apply the setup your team has defined for{' '}
                            <strong>{environmentId}</strong> in this project
                        </>
                    }
                    icon={
                        <FeatureStrategyMenuCardIcon name='defaultStrategy' />
                    }
                    badge={defaultStrategy.title ?? undefined}
                    actionLabel='Apply default'
                    actionDisabled={loading || applying}
                    onAction={onApplyDefault}
                />
                <StrategySetupCard
                    name='Set up manually'
                    description='Choose target audience, exposure percentage, and variants as you prefer.'
                    icon={
                        <FeatureStrategyMenuCardIcon name={MANUAL_STRATEGY} />
                    }
                    badge={MANUAL_STRATEGY_LABEL}
                    actionLabel='Configure'
                    onAction={() =>
                        configureStrategy({
                            strategyName: MANUAL_STRATEGY,
                            strategyDisplayName: MANUAL_STRATEGY_LABEL,
                        })
                    }
                />
                {isEnterprise() && (
                    <StrategySetupCard
                        name='Start from a template'
                        description='Roll out gradually with a predefined sequence of milestones.'
                        icon={
                            <FeatureStrategyMenuCardIcon name='releasePlanTemplate' />
                        }
                        actionLabel='Select template'
                        onAction={onShowTemplates}
                    />
                )}
            </StyledCardGrid>
            <MoreStrategiesMenu
                onSelect={(strategy) =>
                    configureStrategy({
                        strategyName: strategy.name,
                        strategyDisplayName:
                            strategy.displayName ||
                            formatStrategyName(strategy.name),
                    })
                }
            />
        </StyledContainer>
    );
};

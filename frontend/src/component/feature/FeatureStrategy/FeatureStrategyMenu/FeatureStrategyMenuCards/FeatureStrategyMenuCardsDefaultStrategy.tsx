import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import { FeatureStrategyMenuCardAction } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardAction.tsx';
import { FeatureStrategyMenuCardIcon } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardIcon.tsx';
import { useProjectDefaultStrategy } from '../useProjectDefaultStrategy.ts';
import type { IConfigureStrategyOptions } from '../useConfigureStrategy.ts';

const STRATEGY_DISPLAY_NAME = 'Default strategy';

interface IFeatureStrategyMenuCardsDefaultStrategyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    onConfigure: (options: IConfigureStrategyOptions) => void;
    onClose: () => void;
}

export const FeatureStrategyMenuCardsDefaultStrategy = ({
    projectId,
    environmentId,
    featureId,
    onConfigure,
    onClose,
}: IFeatureStrategyMenuCardsDefaultStrategyProps) => {
    const { defaultStrategy, applyDefaultStrategy } = useProjectDefaultStrategy(
        { projectId, featureId, environmentId },
    );

    const onApply = async () => {
        await applyDefaultStrategy();
        onClose();
    };

    return (
        <FeatureStrategyMenuCard
            name={STRATEGY_DISPLAY_NAME}
            description={
                defaultStrategy.title ||
                'This is the default strategy defined for this environment in the project'
            }
            icon={<FeatureStrategyMenuCardIcon name='defaultStrategy' />}
            isDefault
        >
            <FeatureStrategyMenuCardAction
                onClick={() =>
                    onConfigure({
                        strategyName: defaultStrategy.name,
                        strategyDisplayName: STRATEGY_DISPLAY_NAME,
                        isDefault: true,
                    })
                }
            >
                Configure
            </FeatureStrategyMenuCardAction>
            <FeatureStrategyMenuCardAction onClick={onApply}>
                Apply
            </FeatureStrategyMenuCardAction>
        </FeatureStrategyMenuCard>
    );
};

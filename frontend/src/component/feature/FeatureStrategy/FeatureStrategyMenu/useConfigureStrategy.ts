import { useNavigate } from 'react-router';
import { useTracking } from 'hooks/useTracking.ts';
import { formatCreateStrategyPath } from '../FeatureStrategyCreate/FeatureStrategyCreate.tsx';
import {
    createStrategyTracking,
    strategyTypeProps,
} from '../strategyActionsTracking.ts';
import { useEnvironmentDefaultStrategy } from './useEnvironmentDefaultStrategy.ts';

interface IConfigureStrategyContext {
    projectId: string;
    featureId: string;
    environmentId: string;
    onClose: () => void;
}

interface IConfigureStrategyOptions {
    strategyName: string;
}

export const useConfigureStrategy = ({
    projectId,
    featureId,
    environmentId,
    onClose,
}: IConfigureStrategyContext) => {
    const navigate = useNavigate();
    const trackCreateStrategy = useTracking(createStrategyTracking);
    const { defaultStrategy } = useEnvironmentDefaultStrategy(
        projectId,
        environmentId,
    );

    return ({ strategyName }: IConfigureStrategyOptions) => {
        // this needs to happen before navigating, to capture correct path
        trackCreateStrategy(
            'opened',
            strategyTypeProps({
                selectedStrategyName: strategyName,
                defaultStrategyName: defaultStrategy.name,
            }),
        );

        navigate(
            formatCreateStrategyPath(
                projectId,
                featureId,
                environmentId,
                strategyName,
            ),
        );
        onClose();
    };
};

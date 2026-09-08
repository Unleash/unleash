import { useNavigate } from 'react-router';
import { useEventTracker } from 'hooks/useEventTracker.ts';
import { formatCreateStrategyPath } from '../FeatureStrategyCreate/FeatureStrategyCreate.tsx';

interface IConfigureStrategyContext {
    projectId: string;
    featureId: string;
    environmentId: string;
    onClose: () => void;
}

export interface IConfigureStrategyOptions {
    strategyName: string;
    strategyDisplayName?: string;
    isDefault?: boolean;
}

export const useConfigureStrategy = ({
    projectId,
    featureId,
    environmentId,
    onClose,
}: IConfigureStrategyContext) => {
    const navigate = useNavigate();
    const { trackEvent } = useEventTracker();

    return ({
        strategyName,
        strategyDisplayName,
        isDefault,
    }: IConfigureStrategyOptions) => {
        trackEvent('strategy-add', {
            props: {
                buttonTitle: strategyDisplayName || strategyName,
            },
        });

        navigate(
            formatCreateStrategyPath(
                projectId,
                featureId,
                environmentId,
                strategyName,
                isDefault,
            ),
        );
        onClose();
    };
};

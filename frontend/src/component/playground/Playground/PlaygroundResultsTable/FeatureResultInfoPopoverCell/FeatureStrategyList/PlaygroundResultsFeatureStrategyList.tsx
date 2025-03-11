import {
    PlaygroundResultStrategyLists,
    WrappedPlaygroundResultStrategyList,
} from './StrategyList/PlaygroundResultStrategyLists';
import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { Alert } from '@mui/material';

interface PlaygroundResultFeatureStrategyListProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

export const PlaygroundResultFeatureStrategyList = ({
    feature,
    input,
}: PlaygroundResultFeatureStrategyListProps) => {
    const enabledStrategies = feature.strategies?.data?.filter(
        (strategy) => !strategy.disabled,
    );
    const disabledStrategies = feature.strategies?.data?.filter(
        (strategy) => strategy.disabled,
    );

    const showDisabledStrategies = disabledStrategies?.length > 0;

    if ((feature?.strategies?.data.length ?? 0) === 0) {
        return (
            <Alert severity='warning' sx={{ mt: 2 }}>
                There are no strategies added to this feature flag in the
                selected environment.
            </Alert>
        );
    }

    if (
        (feature.hasUnsatisfiedDependency ||
            !feature.isEnabledInCurrentEnvironment) &&
        Boolean(feature?.strategies?.data)
    ) {
        return (
            <WrappedPlaygroundResultStrategyList
                feature={feature}
                input={input}
            />
        );
    }

    return (
        <>
            <PlaygroundResultStrategyLists
                strategies={enabledStrategies || []}
                input={input}
                titlePrefix={showDisabledStrategies ? 'Enabled' : ''}
            />
            {showDisabledStrategies ? (
                <PlaygroundResultStrategyLists
                    strategies={disabledStrategies}
                    input={input}
                    titlePrefix={'Disabled'}
                    infoText={
                        'Disabled strategies are not evaluated for the overall result.'
                    }
                />
            ) : null}
        </>
    );
};

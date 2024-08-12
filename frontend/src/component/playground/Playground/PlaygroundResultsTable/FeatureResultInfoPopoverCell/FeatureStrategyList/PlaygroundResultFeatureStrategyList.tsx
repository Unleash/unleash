import {
    PlaygroundResultStrategyLists,
    WrappedPlaygroundResultStrategyList,
} from './StrategyList/playgroundResultStrategyLists';
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

    return (
        <>
            {feature?.strategies?.data?.length === 0 ? (
                <Alert severity='warning' sx={{ mt: 2 }}>
                    There are no strategies added to this feature flag in
                    selected environment.
                </Alert>
            ) : null}
            {(feature.hasUnsatisfiedDependency ||
                !feature.isEnabledInCurrentEnvironment) &&
            Boolean(feature?.strategies?.data) ? (
                <WrappedPlaygroundResultStrategyList
                    feature={feature}
                    input={input}
                />
            ) : (
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
            )}
        </>
    );
};

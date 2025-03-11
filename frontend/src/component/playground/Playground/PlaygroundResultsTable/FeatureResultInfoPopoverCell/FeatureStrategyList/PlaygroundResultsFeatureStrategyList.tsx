import {
    PlaygroundResultStrategyLists,
    WrappedPlaygroundResultStrategyList,
} from './StrategyList/playgroundResultStrategyLists';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
            <ConditionallyRender
                condition={feature?.strategies?.data?.length === 0}
                show={
                    <Alert severity='warning' sx={{ mt: 2 }}>
                        There are no strategies added to this feature flag in
                        selected environment.
                    </Alert>
                }
            />
            <ConditionallyRender
                condition={
                    (feature.hasUnsatisfiedDependency ||
                        !feature.isEnabledInCurrentEnvironment) &&
                    Boolean(feature?.strategies?.data)
                }
                show={
                    <WrappedPlaygroundResultStrategyList
                        feature={feature}
                        input={input}
                    />
                }
                elseShow={
                    <>
                        <PlaygroundResultStrategyLists
                            strategies={enabledStrategies || []}
                            input={input}
                            titlePrefix={
                                showDisabledStrategies ? 'Enabled' : ''
                            }
                        />
                        <ConditionallyRender
                            condition={showDisabledStrategies}
                            show={
                                <PlaygroundResultStrategyLists
                                    strategies={disabledStrategies}
                                    input={input}
                                    titlePrefix={'Disabled'}
                                    infoText={
                                        'Disabled strategies are not evaluated for the overall result.'
                                    }
                                />
                            }
                        />
                    </>
                }
            />
        </>
    );
};

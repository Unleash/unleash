import {
    PlaygroundResultStrategyLists,
    WrappedPlaygroundResultStrategyList,
} from './StrategyList/playgroundResultStrategyLists';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { Alert } from '@mui/material';
import { useUiFlag } from '../../../../../../hooks/useUiFlag';

interface PlaygroundResultFeatureStrategyListProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

export const PlaygroundResultFeatureStrategyList = ({
    feature,
    input,
}: PlaygroundResultFeatureStrategyListProps) => {
    const playgroundImprovements = useUiFlag('playgroundImprovements');
    const enabledStrategies = feature.strategies?.data?.filter(
        (strategy) => !strategy.disabled,
    );
    const disabledStrategies = feature.strategies?.data?.filter(
        (strategy) => strategy.disabled,
    );

    const showDisabledStrategies =
        playgroundImprovements && disabledStrategies?.length > 0;

    return (
        <>
            <ConditionallyRender
                condition={feature?.strategies?.data?.length === 0}
                show={
                    <Alert severity='warning' sx={{ mt: 2 }}>
                        There are no strategies added to this feature toggle in
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

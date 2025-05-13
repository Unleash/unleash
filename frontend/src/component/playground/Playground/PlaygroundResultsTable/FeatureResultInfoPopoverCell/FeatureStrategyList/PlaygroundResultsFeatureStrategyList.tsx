import { Alert } from '@mui/material';
import { PlaygroundResultStrategyLists } from './StrategyList/PlaygroundResultStrategyLists.tsx';
import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import type { FC } from 'react';

interface PlaygroundResultFeatureStrategyListProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

const UnevaluatedUnsatisfiedInfo: FC<{ feature: PlaygroundFeatureSchema }> = ({
    feature,
}) => {
    if (!feature?.strategies?.data) {
        return null;
    }

    let text: string | undefined;

    if (
        feature.hasUnsatisfiedDependency &&
        !feature.isEnabledInCurrentEnvironment
    ) {
        text =
            'If the environment was enabled and parent dependencies were satisfied';
    } else if (feature.hasUnsatisfiedDependency) {
        text = 'If parent dependencies were satisfied';
    } else if (!feature.isEnabledInCurrentEnvironment) {
        text = 'If the environment was enabled';
    } else {
        return;
    }

    return (
        <Alert severity={'info'} color={'info'}>
            {text}, then this feature flag would be{' '}
            {feature.strategies?.result ? 'TRUE' : 'FALSE'} with strategies
            evaluated like this:
        </Alert>
    );
};

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
            <Alert severity='info'>
                There are no strategies added to this feature flag in the
                selected environment.
            </Alert>
        );
    }

    return (
        <>
            <UnevaluatedUnsatisfiedInfo feature={feature} />
            <PlaygroundResultStrategyLists
                strategies={enabledStrategies || []}
                input={input}
                titlePrefix={showDisabledStrategies ? 'Enabled' : undefined}
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

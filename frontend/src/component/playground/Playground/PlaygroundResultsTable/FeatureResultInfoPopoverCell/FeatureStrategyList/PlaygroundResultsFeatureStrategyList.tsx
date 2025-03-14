import { PlaygroundResultStrategyLists } from './StrategyList/PlaygroundResultStrategyLists';
import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { Alert, styled } from '@mui/material';

interface PlaygroundResultFeatureStrategyListProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginInline: `var(--popover-inline-padding, ${theme.spacing(4)})`,
}));

const DisabledInfo = ({ feature }: { feature: PlaygroundFeatureSchema }) => {
    const resolveHintText = (feature: PlaygroundFeatureSchema) => {
        if (
            feature.hasUnsatisfiedDependency &&
            !feature.isEnabledInCurrentEnvironment
        ) {
            return 'If the environment was enabled and parent dependencies were satisfied';
        }
        if (feature.hasUnsatisfiedDependency) {
            return 'If parent dependencies were satisfied';
        }
        if (!feature.isEnabledInCurrentEnvironment) {
            return 'If the environment was enabled';
        }
        return '';
    };

    const text = resolveHintText(feature);

    if (!text) {
        return null;
    }

    return (
        <StyledAlert severity={'info'} color={'info'}>
            {resolveHintText(feature)}, then this feature flag would be{' '}
            {feature.strategies?.result ? 'TRUE' : 'FALSE'} with strategies
            evaluated like this:{' '}
        </StyledAlert>
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
            <Alert severity='warning' sx={{ mt: 2 }}>
                There are no strategies added to this feature flag in the
                selected environment.
            </Alert>
        );
    }

    return (
        <>
            <DisabledInfo feature={feature} />
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

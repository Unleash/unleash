import { Alert, styled, Typography } from '@mui/material';
import type {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
    PlaygroundFeatureSchema,
} from 'openapi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledContentList,
    StyledListItem,
} from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/EnvironmentAccordionBody';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { FeatureStrategyItem } from './StrategyItem/FeatureStrategyItem';

const StyledAlertWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: `0, 4px`,
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.warning.border}`,
}));

const StyledListWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1, 0.5),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    border: '0!important',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottom: `1px solid ${theme.palette.warning.border}!important`,
}));

interface PlaygroundResultStrategyListProps {
    strategies: PlaygroundStrategySchema[];
    input?: PlaygroundRequestSchema;
    titlePrefix?: 'Enabled' | 'Disabled';
    infoText?: string;
}

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(2, 1, 2, 0),
    color: 'text.secondary',
}));

export const PlaygroundResultStrategyLists = ({
    strategies,
    input,
    titlePrefix,
    infoText,
}: PlaygroundResultStrategyListProps) => (
    <ConditionallyRender
        condition={strategies.length > 0}
        show={
            <>
                <StyledSubtitle variant={'subtitle1'}>{`${
                    titlePrefix
                        ? titlePrefix.concat(' strategies')
                        : 'Strategies'
                } (${strategies?.length})`}</StyledSubtitle>
                <ConditionallyRender
                    condition={Boolean(infoText)}
                    show={
                        <StyledSubtitle variant={'subtitle2'}>
                            {infoText}
                        </StyledSubtitle>
                    }
                />
                <StyledContentList>
                    {strategies?.map((strategy, index) => (
                        <StyledListItem key={strategy.id}>
                            {index > 0 ? <StrategySeparator /> : ''}
                            <FeatureStrategyItem
                                strategy={strategy}
                                input={input}
                            />
                        </StyledListItem>
                    ))}
                </StyledContentList>
            </>
        }
    />
);

interface IWrappedPlaygroundResultStrategyListProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

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

export const WrappedPlaygroundResultStrategyList = ({
    feature,
    input,
}: IWrappedPlaygroundResultStrategyListProps) => {
    const enabledStrategies = feature.strategies?.data?.filter(
        (strategy) => !strategy.disabled,
    );
    const disabledStrategies = feature.strategies?.data?.filter(
        (strategy) => strategy.disabled,
    );

    const showDisabledStrategies = disabledStrategies?.length > 0;

    return (
        <StyledAlertWrapper sx={{ pb: 1, mt: 2 }}>
            <StyledAlert severity={'info'} color={'warning'}>
                {resolveHintText(feature)}, then this feature flag would be{' '}
                {feature.strategies?.result ? 'TRUE' : 'FALSE'} with strategies
                evaluated like this:{' '}
            </StyledAlert>
            <StyledListWrapper sx={{ p: 2.5 }}>
                <PlaygroundResultStrategyLists
                    strategies={enabledStrategies || []}
                    input={input}
                    titlePrefix={showDisabledStrategies ? 'Enabled' : ''}
                />
            </StyledListWrapper>
            <ConditionallyRender
                condition={showDisabledStrategies}
                show={
                    <StyledListWrapper sx={{ p: 2.5 }}>
                        <PlaygroundResultStrategyLists
                            strategies={disabledStrategies}
                            input={input}
                            titlePrefix={'Disabled'}
                            infoText={
                                'Disabled strategies are not evaluated for the overall result.'
                            }
                        />
                    </StyledListWrapper>
                }
            />
        </StyledAlertWrapper>
    );
};

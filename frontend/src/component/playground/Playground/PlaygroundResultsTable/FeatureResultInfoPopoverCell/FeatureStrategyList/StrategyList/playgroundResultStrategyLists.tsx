import { Fragment } from 'react';
import { Alert, Box, styled, Typography } from '@mui/material';
import {
    PlaygroundFeatureSchema,
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStrategyItem } from './StrategyItem/FeatureStrategyItem';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';

const StyledAlertWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: `0, 4px`,
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.info.border}`,
}));

const StyledListWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1, 0.5),
}));

const StyledAlert = styled(Alert)(() => ({
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
}));

interface PlaygroundResultStrategyListProps {
    strategies: PlaygroundStrategySchema[];
    input?: PlaygroundRequestSchema;
}

export const PlaygroundResultStrategyLists = ({
    strategies,
    input,
}: PlaygroundResultStrategyListProps) => (
    <ConditionallyRender
        condition={strategies.length > 0}
        show={
            <>
                <Typography
                    variant={'subtitle1'}
                    sx={{ mt: 2, ml: 1, mb: 2, color: 'text.secondary' }}
                >{`Strategies (${strategies.length})`}</Typography>
                <Box sx={{ width: '100%' }}>
                    {strategies.map((strategy, index) => (
                        <Fragment key={strategy.id}>
                            <ConditionallyRender
                                condition={index > 0}
                                show={<StrategySeparator text="OR" />}
                            />
                            <FeatureStrategyItem
                                key={strategy.id}
                                strategy={strategy}
                                index={index}
                                input={input}
                            />
                        </Fragment>
                    ))}
                </Box>
            </>
        }
    />
);

interface WrappedPlaygroundResultStrategyListProps
    extends PlaygroundResultStrategyListProps {
    feature: PlaygroundFeatureSchema;
}

export const WrappedPlaygroundResultStrategyList = ({
    strategies,
    feature,
    input,
}: WrappedPlaygroundResultStrategyListProps) => {
    return (
        <StyledAlertWrapper sx={{ pb: 1 }}>
            <StyledAlert severity={'info'} color={'info'}>
                If environment would be enabled then this feature would be{' '}
                {feature.strategies.result ? 'TRUE' : 'FALSE'} and the
                strategies would evaluate like this:{' '}
            </StyledAlert>
            <StyledListWrapper>
                <PlaygroundResultStrategyLists
                    strategies={strategies}
                    input={input}
                />
            </StyledListWrapper>
        </StyledAlertWrapper>
    );
};

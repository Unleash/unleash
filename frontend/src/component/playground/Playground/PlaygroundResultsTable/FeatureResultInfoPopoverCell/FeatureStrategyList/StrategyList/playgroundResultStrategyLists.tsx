import { Fragment } from 'react';
import { Alert, Box, styled, Typography } from '@mui/material';
import {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
    PlaygroundStrategyResultSchema,
} from 'component/playground/Playground/interfaces/playground.model';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStrategyItem } from './StrategyItem/FeatureStrategyItem';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';

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
                >{`Strategies (${strategies?.length})`}</Typography>
                <Box sx={{ width: '100%' }}>
                    {strategies?.map((strategy, index) => (
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

interface IWrappedPlaygroundResultStrategyListProps {
    strategies: PlaygroundStrategyResultSchema;
    input?: PlaygroundRequestSchema;
}

export const WrappedPlaygroundResultStrategyList = ({
    strategies,
    input,
}: IWrappedPlaygroundResultStrategyListProps) => {
    return (
        <StyledAlertWrapper sx={{ pb: 1, mt: 2 }}>
            <StyledAlert severity={'info'} color={'warning'}>
                If environment was enabled, then this feature toggle would be{' '}
                {strategies?.result ? 'TRUE' : 'FALSE'} with strategies
                evaluated like so:{' '}
            </StyledAlert>
            <StyledListWrapper sx={{ p: 2.5 }}>
                <PlaygroundResultStrategyLists
                    strategies={strategies?.data || []}
                    input={input}
                />
            </StyledListWrapper>
        </StyledAlertWrapper>
    );
};

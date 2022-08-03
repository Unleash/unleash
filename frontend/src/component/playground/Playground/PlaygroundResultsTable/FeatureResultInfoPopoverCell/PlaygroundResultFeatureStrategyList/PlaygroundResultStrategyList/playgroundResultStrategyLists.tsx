import {
    PlaygroundFeatureSchema,
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from '../../../../../../../hooks/api/actions/usePlayground/playground.model';
import { ConditionallyRender } from '../../../../../../common/ConditionallyRender/ConditionallyRender';
import { Alert, styled, Typography } from '@mui/material';
import { PlaygroundResultFeatureStrategyItem } from './PlaygroundResultFeatureStrategyItem/PlaygroundResultFeatureStrategyItem';

const StyledAlertWrapper = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.info.border}`,
}));

const StyledListWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1, 0.5),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
}));

interface PlaygroundResultStrategyListProps {
    strategies: PlaygroundStrategySchema[];
    input?: PlaygroundRequestSchema;
    compact?: boolean;
}

export const PlaygroundResultStrategyLists = ({
    strategies,
    input,
    compact = false,
}: PlaygroundResultStrategyListProps) => {
    console.log(strategies);
    return (
        <ConditionallyRender
            condition={strategies.length > 0}
            show={
                <>
                    <Typography
                        variant={'subtitle1'}
                        sx={{ mt: 2, ml: 1, mb: 2, color: 'text.secondary' }}
                    >{`Strategies (${strategies.length})`}</Typography>
                    {strategies.map((strategy, index) => (
                        <PlaygroundResultFeatureStrategyItem
                            key={strategy.id}
                            strategy={strategy}
                            index={index}
                            compact={compact}
                            input={input}
                        />
                    ))}
                </>
            }
        />
    );
};

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
        <StyledAlertWrapper>
            <StyledAlert severity={'info'} color={'info'}>
                If environment would be enabled then this feature would be{' '}
                {feature.isEnabled ? 'TRUE' : 'FALSE'} and the strategies would
                evaluate like this:{' '}
            </StyledAlert>
            <StyledListWrapper>
                <PlaygroundResultStrategyLists
                    strategies={strategies}
                    input={input}
                    compact
                />
            </StyledListWrapper>
        </StyledAlertWrapper>
    );
};

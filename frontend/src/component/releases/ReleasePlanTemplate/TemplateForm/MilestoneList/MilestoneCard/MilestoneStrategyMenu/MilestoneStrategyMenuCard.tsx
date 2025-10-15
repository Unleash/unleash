import {
    formatStrategyName,
    getFeatureStrategyIcon,
} from 'utils/strategyNames';
import { styled } from '@mui/material';
import type { IStrategy } from 'interfaces/strategy';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { createFeatureStrategy } from 'utils/createFeatureStrategy';

const StyledIcon = styled('div')(({ theme }) => ({
    width: theme.spacing(4),
    height: 'auto',
    '& > svg': {
        // Styling for SVG icons.
        fill: theme.palette.primary.main,
    },
    '& > div': {
        // Styling for the Rollout icon.
        height: theme.spacing(2),
        marginLeft: '-.75rem',
        color: theme.palette.primary.main,
    },
}));

const StyledDescription = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledName = styled(StringTruncator)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledCard = styled('div')(({ theme }) => ({
    display: 'grid',
    cursor: 'pointer',
    gridTemplateColumns: '3rem 1fr',
    width: '20rem',
    padding: theme.spacing(2),
    color: 'inherit',
    textDecoration: 'inherit',
    lineHeight: 1.25,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(1),
    '&:hover, &:focus': {
        borderColor: theme.palette.primary.main,
    },
}));

interface IMilestoneStrategyMenuCardProps {
    strategy: IStrategy;
    onClick: (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => void;
}

export const MilestoneStrategyMenuCard = ({
    strategy,
    onClick,
}: IMilestoneStrategyMenuCardProps) => {
    const StrategyIcon = getFeatureStrategyIcon(strategy.name);
    const strategyName = formatStrategyName(strategy.name);
    return (
        <StyledCard
            onClick={() => {
                const strat = createFeatureStrategy('', strategy);
                if (strat.name === 'flexibleRollout') {
                    strat.parameters = {
                        ...strat.parameters,
                        groupId: '{{featureName}}',
                    };
                }
                onClick({
                    id: crypto.randomUUID(),
                    name: strat.name,
                    strategyName: strat.name,
                    title: '',
                    constraints: strat.constraints,
                    parameters: strat.parameters,
                });
            }}
        >
            <StyledIcon>
                <StrategyIcon />
            </StyledIcon>
            <div>
                <StyledName
                    text={strategy.displayName || strategyName}
                    maxWidth='200'
                    maxLength={25}
                />
                <StyledDescription>{strategy.description}</StyledDescription>
            </div>
        </StyledCard>
    );
};

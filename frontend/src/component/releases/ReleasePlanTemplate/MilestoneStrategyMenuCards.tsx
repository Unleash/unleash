import { List, ListItem, styled, Typography } from '@mui/material';
import { MilestoneStrategyMenuCard } from './MilestoneStrategyMenuCard';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    padding: theme.spacing(1, 2),
}));

interface IMilestoneStrategyMenuCardsProps {
    milestoneId: string;
    openAddStrategy: (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => void;
}

export const MilestoneStrategyMenuCards = ({
    milestoneId,
    openAddStrategy,
}: IMilestoneStrategyMenuCardsProps) => {
    const { strategies } = useStrategies();

    const preDefinedStrategies = strategies.filter(
        (strategy) => !strategy.deprecated && !strategy.editable,
    );

    const onClick = (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        openAddStrategy(milestoneId, strategy);
    };

    return (
        <List dense>
            <>
                <StyledTypography color='textSecondary'>
                    Predefined strategy types
                </StyledTypography>
                {preDefinedStrategies.map((strategy) => (
                    <ListItem key={strategy.name}>
                        <MilestoneStrategyMenuCard
                            strategy={strategy}
                            onClick={onClick}
                        />
                    </ListItem>
                ))}
            </>
        </List>
    );
};

import { Box, styled } from '@mui/material';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 4, 4, 4),
}));

interface IStrategySetupCardsProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    onClose: () => void;
}

// TODO
export const StrategySetupCards = (_props: IStrategySetupCardsProps) => (
    <StyledContainer>To do</StyledContainer>
);

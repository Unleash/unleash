import { Box, styled, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const StyledStrategyModalSectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    width: '100%',
}));

const StyledStrategyModalSectionGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    width: '100%',
}));

interface IFeatureStrategyMenuCardsSectionProps {
    title?: string;
    children: ReactNode;
}

export const FeatureStrategyMenuCardsSection = ({
    title,
    children,
}: IFeatureStrategyMenuCardsSectionProps) => (
    <Box>
        {title && (
            <StyledStrategyModalSectionHeader>
                <Typography color='inherit' variant='body2'>
                    {title}
                </Typography>
            </StyledStrategyModalSectionHeader>
        )}
        <StyledStrategyModalSectionGrid>
            {children}
        </StyledStrategyModalSectionGrid>
    </Box>
);

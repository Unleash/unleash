import { Box, Button, styled } from '@mui/material';
import type { ReactNode } from 'react';

export const StyledStrategyModalSectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    width: '100%',
    fontSize: theme.typography.body2.fontSize,
}));

const StyledStrategyModalSectionGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(1, 1fr)',
    },
    gap: theme.spacing(2),
    width: '100%',
}));

const StyledViewMoreButton = styled(Button)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: theme.spacing(10),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
}));

interface IFeatureStrategyMenuCardsSectionProps {
    title?: ReactNode;
    limit?: number;
    viewMore?: () => void;
    viewMoreLabel?: string;
    children: ReactNode;
}

export const FeatureStrategyMenuCardsSection = ({
    title,
    limit,
    viewMore,
    viewMoreLabel = 'View more strategies',
    children,
}: IFeatureStrategyMenuCardsSectionProps) => {
    const allChildren = Array.isArray(children) ? children : [children];
    const limitedChildren = limit ? allChildren.slice(0, limit) : allChildren;

    return (
        <Box>
            {title && (
                <StyledStrategyModalSectionHeader>
                    {title}
                </StyledStrategyModalSectionHeader>
            )}
            <StyledStrategyModalSectionGrid>
                {limitedChildren}
                {viewMore && limitedChildren.length < allChildren.length && (
                    <StyledViewMoreButton
                        variant='text'
                        size='small'
                        onClick={viewMore}
                    >
                        {viewMoreLabel}
                    </StyledViewMoreButton>
                )}
            </StyledStrategyModalSectionGrid>
        </Box>
    );
};

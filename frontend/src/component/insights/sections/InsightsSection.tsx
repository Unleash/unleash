import { styled, Typography } from '@mui/material';
import { forwardRef, type PropsWithChildren, type ReactNode } from 'react';

const StyledSection = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const SectionTitleRow = styled('div')(({ theme }) => ({
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
    paddingBlock: theme.spacing(2),
    background: theme.palette.background.application,
    transition: 'padding 0.3s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexFlow: 'row wrap',
    rowGap: theme.spacing(2),
}));

export const InsightsSection = forwardRef<
    HTMLElement,
    PropsWithChildren<{ title: string; filters?: ReactNode }>
>(({ title, children, filters: HeaderActions }, ref) => (
    <StyledSection ref={ref}>
        <SectionTitleRow>
            <Typography variant='h2'>{title}</Typography>
            {HeaderActions}
        </SectionTitleRow>
        {children}
    </StyledSection>
));

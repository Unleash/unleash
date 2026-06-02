import type { FC } from 'react';
import { Typography, styled } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(6, 4),
    textAlign: 'center',
}));

/**
 * Stub page for the Impact Views feature. The full implementation (view
 * switcher, goal-tracking / system-health charts, editor) is introduced in
 * later PRs — see ./README.md for the rollout plan. Gated behind the
 * `impactViews` flag via the `/impact-views` route.
 */
export const ImpactViewsPage: FC = () => (
    <StyledWrapper>
        <PageContent header={<PageHeader title='Impact views' />}>
            <StyledContent>
                <Typography variant='h3' component='h2' sx={{ mb: 1.5 }}>
                    Impact views are on the way
                </Typography>
                <Typography sx={{ color: 'text.secondary', maxWidth: 480 }}>
                    Follow a set of features and their impact metrics together
                    on a single chart. This experimental feature is still being
                    put together.
                </Typography>
            </StyledContent>
        </PageContent>
    </StyledWrapper>
);

import type { FC } from 'react';
import { Alert, Box, Button, styled, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import ImpactMetricsIcon from 'assets/img/impact-metrics-icon.svg?react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';

const DOCS_URL = 'https://docs.getunleash.io/reference/impact-metrics';

const StyledContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(6, 4),
}));

const StyledIllustration = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledTextContent = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    maxWidth: 520,
    marginBottom: theme.spacing(3),
}));

const StyledButtons = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    marginBottom: theme.spacing(4),
}));

const StyledTip = styled(Alert)(({ theme }) => ({
    maxWidth: 520,
    backgroundColor: theme.palette.info.light,
    marginTop: theme.spacing(4),
    color: theme.palette.info.dark,
    '& .MuiAlert-icon': {
        color: theme.palette.info.main,
    },
}));

export type ImpactMetricViewsEmptyStateProps = {
    onCreate: () => void;
};

export const ImpactMetricViewsEmptyState: FC<
    ImpactMetricViewsEmptyStateProps
> = ({ onCreate }) => (
    <PageContent header={<PageHeader title='Impact views' />}>
        <StyledContent>
            <StyledIllustration>
                <ImpactMetricsIcon />
            </StyledIllustration>
            <StyledTextContent>
                <Typography variant='h3' component='h2' sx={{ mb: 1.5 }}>
                    Start telling a story with your metrics
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                    A view combines the features you want to follow with the
                    impact metrics that matter to you. Toggle events for each
                    feature are drawn over the chart so you can see exactly when
                    a rollout moved the needle.
                </Typography>
            </StyledTextContent>

            <StyledButtons>
                <Button
                    variant='text'
                    href={DOCS_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Read the docs
                </Button>
                <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={onCreate}
                >
                    Create your first view
                </Button>
            </StyledButtons>

            <StyledTip severity='info' icon={<InfoOutlinedIcon />}>
                <strong>Tip:</strong> Views are stored locally in your browser —
                only you can see them in this iteration.
            </StyledTip>
        </StyledContent>
    </PageContent>
);

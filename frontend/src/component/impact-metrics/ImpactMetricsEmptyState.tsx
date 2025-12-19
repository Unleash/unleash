import { Alert, Box, Button, styled, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ReactComponent as ImpactMetricsIcon } from 'assets/img/impact-metrics-icon.svg';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { ADMIN } from '../providers/AccessProvider/permissions';

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
    maxWidth: 480,
    marginBottom: theme.spacing(3),
}));

const StyledButtons = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    marginBottom: theme.spacing(4),
}));

const StyledTip = styled(Alert)(({ theme }) => ({
    maxWidth: 480,
    backgroundColor: theme.palette.info.light,
    marginTop: theme.spacing(4),
    color: theme.palette.info.dark,
    '& .MuiAlert-icon': {
        color: theme.palette.info.main,
    },
}));

interface ImpactMetricsEmptyStateProps {
    onAddChart: () => void;
}

export const ImpactMetricsEmptyState = ({
    onAddChart,
}: ImpactMetricsEmptyStateProps) => {
    return (
        <PageContent
            header={
                <PageHeader
                    title='Impact metrics'
                    actions={
                        <PermissionButton
                            variant='contained'
                            onClick={onAddChart}
                            permission={ADMIN}
                        >
                            New chart
                        </PermissionButton>
                    }
                />
            }
        >
            <StyledContent>
                <StyledIllustration>
                    <ImpactMetricsIcon />
                </StyledIllustration>

                <StyledTextContent>
                    <Typography variant='h3' component='h2' sx={{ mb: 1.5 }}>
                        No impact metrics yet
                    </Typography>
                    <Typography color='text.secondary'>
                        Impact metrics help you measure how feature flags affect
                        your application's performance. Get started by sending
                        your first metrics from your code.
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
                    <PermissionButton
                        variant='contained'
                        onClick={onAddChart}
                        permission={ADMIN}
                    >
                        Create your first chart
                    </PermissionButton>
                </StyledButtons>

                <StyledTip severity='info' icon={<InfoOutlinedIcon />}>
                    <strong>Tip:</strong> Once you've set up metrics, you'll be
                    able to create charts, set up safeguards, and monitor your
                    application's health in real-time.
                </StyledTip>
            </StyledContent>
        </PageContent>
    );
};

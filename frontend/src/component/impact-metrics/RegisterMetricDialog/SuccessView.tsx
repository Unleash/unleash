import {
    Box,
    Button,
    CircularProgress,
    Typography,
    styled,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { useTrackRegisterImpactMetrics } from './useTrackRegisterImpactMetrics';
import { Link } from 'react-router-dom';
import { useCheckMetricAvailable } from './useCheckMetricAvailable';

type SuccessViewProps = {
    metricName: string;
};

const StyledIconWrapper = styled(Box)(({ theme }) => ({
    alignItems: 'center',
    aspectRatio: '1 / 1',
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadiusMedium,
    display: 'flex',
    justifyContent: 'center',
    width: theme.spacing(6),
}));

const SuccessBox = styled(Box)(({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    flex: 'auto',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBlock: theme.spacing(2),
    textAlign: 'center',
}));

const StyledIcon = styled(CodeIcon)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
}));

const TextContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    maxWidth: '423px',
    marginBlockStart: theme.spacing(2),
    marginBlockEnd: theme.spacing(2.5),
    p: {
        color: theme.palette.text.secondary,
    },
}));

const StyledMetricName = styled(Typography)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadiusMedium,
    width: 'fit-content',
}));

const StyledLoading = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
});

export const SuccessView = ({ metricName }: SuccessViewProps) => {
    const { trackDocsClickedAfterCreation } = useTrackRegisterImpactMetrics();
    const { isAvailable, timedOut } = useCheckMetricAvailable(metricName);

    return (
        <SuccessBox>
            <StyledIconWrapper>
                <StyledIcon />
            </StyledIconWrapper>

            <TextContent>
                <Typography variant='h2' component='h4'>
                    Implement the impact metric
                </Typography>
                <Typography>
                    The metric will be available in the UI shortly (typically
                    within a minute). You'll need to add it to your code to
                    start receiving actual metric data.
                </Typography>
                <StyledMetricName>
                    <Typography component='span' fontWeight='bold'>
                        Metric name:&nbsp;
                    </Typography>
                    {metricName}
                </StyledMetricName>
                {isAvailable ? (
                    <Typography variant='body2'>
                        The metric is now available.
                    </Typography>
                ) : timedOut ? (
                    <Typography variant='body2'>
                        Your metric may take a bit longer to become available.
                        You can close this dialog and check back shortly.
                    </Typography>
                ) : (
                    <StyledLoading>
                        <CircularProgress size={16} />
                        <Typography variant='body2'>
                            Waiting for metric to become available…
                        </Typography>
                    </StyledLoading>
                )}
            </TextContent>

            <Button
                component={Link}
                target='_blank'
                rel='noopener noreferrer'
                variant='contained'
                to='https://docs.getunleash.io/concepts/impact-metrics#define-and-record-metrics-in-the-sdk'
                onClick={() => trackDocsClickedAfterCreation()}
            >
                View instructions
            </Button>
        </SuccessBox>
    );
};

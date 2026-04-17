import { Box, Button, Typography, styled } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { useTrackRegisterImpactMetrics } from './useTrackRegisterImpactMetrics';
import { Link } from 'react-router-dom';

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

export const SuccessView = ({ metricName }: SuccessViewProps) => {
    const { trackDocsClickedAfterCreation } = useTrackRegisterImpactMetrics();

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

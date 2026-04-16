import { Box, Typography, styled } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTrackRegisterImpactMetrics } from './useTrackRegisterImpactMetrics';
import { Card, ExternalLink } from './RegisterMetricDialog.styles';

type SuccessViewProps = {
    metricName: string;
};

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const StyledIconWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
    borderRadius: '50%',
    backgroundColor: theme.palette.success.light,
    margin: '0 auto',
    marginBottom: theme.spacing(2),
}));

const SuccessBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
}));

const StyledCheckIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
    color: theme.palette.success.main,
    fontSize: theme.spacing(4),
}));

const StyledParagraph = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledSubHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
})) as typeof Typography;

export const SuccessView = ({ metricName }: SuccessViewProps) => {
    const { trackDocsClickedAfterCreation } = useTrackRegisterImpactMetrics();

    return (
        <StyledContainer>
            <SuccessBox>
                <StyledIconWrapper>
                    <StyledCheckIcon />
                </StyledIconWrapper>
                <Typography variant='h2' component='h4'>
                    Metric registered
                </Typography>
                <StyledParagraph variant='body2'>
                    Your impact metric <strong>{metricName}</strong> has been
                    created.
                </StyledParagraph>
                <StyledParagraph variant='body2'>
                    It will be available in a few seconds.
                </StyledParagraph>
            </SuccessBox>

            <Box>
                <StyledSubHeader component='h5' variant='subtitle1'>
                    What's next?
                </StyledSubHeader>
                <Card>
                    <StyledSubHeader
                        data-card-action
                        to='https://docs.getunleash.io/concepts/impact-metrics#define-and-record-metrics-in-the-sdk'
                        onClick={() => trackDocsClickedAfterCreation()}
                        variant='subtitle2'
                        component={ExternalLink}
                    >
                        Implement in your code
                    </StyledSubHeader>
                    <StyledParagraph variant='body2'>
                        To start collecting data, you need to implement the
                        metric in your application code using one of our SDKs.
                        View the documentation for setup instructions.
                    </StyledParagraph>
                </Card>
            </Box>
        </StyledContainer>
    );
};

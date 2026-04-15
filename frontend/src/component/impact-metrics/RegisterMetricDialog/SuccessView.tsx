import { Box, Link, Typography, styled } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTrackRegisterImpactMetrics } from './useTrackRegisterImpactMetrics';

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

const StyledSuccessBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
}));

const StyledCheckIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
    color: theme.palette.success.main,
    fontSize: theme.spacing(4),
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledParagraph = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledNextStepCard = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
}));

const StyledSubHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
}));

export const SuccessView = ({ metricName }: SuccessViewProps) => {
    const { trackDocsClickedAfterCreation } = useTrackRegisterImpactMetrics();

    return (
        <StyledContainer>
            <StyledSuccessBox>
                <StyledIconWrapper>
                    <StyledCheckIcon />
                </StyledIconWrapper>
                <StyledHeader variant='h2'>Metric registered</StyledHeader>
                <StyledParagraph variant='body2'>
                    Your impact metric <strong>{metricName}</strong> has been
                    created.
                    <br />
                    It will be available in a few seconds.
                </StyledParagraph>
            </StyledSuccessBox>

            <Box>
                <StyledSubHeader variant='body2'>What's next?</StyledSubHeader>
                <StyledNextStepCard>
                    <StyledSubHeader variant='body2'>
                        Implement in your code
                    </StyledSubHeader>
                    <StyledParagraph variant='body2'>
                        To start collecting data, you need to implement the
                        metric in your application code using one of our SDKs.{' '}
                        <Link
                            href='https://docs.getunleash.io/reference/impact-metrics'
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={trackDocsClickedAfterCreation}
                        >
                            View the documentation
                        </Link>{' '}
                        for setup instructions.
                    </StyledParagraph>
                </StyledNextStepCard>
            </Box>
        </StyledContainer>
    );
};

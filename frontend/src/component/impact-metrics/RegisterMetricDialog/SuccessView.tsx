import { Box, Typography, type TypographyProps, styled } from '@mui/material';
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

const NextStepCard = styled(Box)(({ theme }) => ({
    position: 'relative',
    border: `1.5px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    transition: 'border-color 120ms ease',
    '&:hover, &:focus-within': {
        borderColor: theme.palette.primary.main,
    },
}));

const CardLink = styled('a')(({ theme }) => ({
    color: 'inherit',
    textDecoration: 'none',
    '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
    },
    '&:focus-visible': {
        outline: 'none',
    },
}));

const StyledSubHeader = styled(Typography)<TypographyProps>(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
}));

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
                <NextStepCard>
                    <StyledSubHeader variant='subtitle1'>
                        <CardLink
                            href='https://docs.getunleash.io/concepts/impact-metrics#define-and-record-metrics-in-the-sdk'
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={() => trackDocsClickedAfterCreation()}
                        >
                            Implement in your code
                        </CardLink>
                    </StyledSubHeader>
                    <StyledParagraph variant='body2'>
                        To start collecting data, you need to implement the
                        metric in your application code using one of our SDKs.
                        View the documentation for setup instructions.
                    </StyledParagraph>
                </NextStepCard>
            </Box>
        </StyledContainer>
    );
};

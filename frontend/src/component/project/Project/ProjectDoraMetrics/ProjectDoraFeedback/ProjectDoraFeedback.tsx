import { useState, useEffect } from 'react';
import { Box, Button, Divider, Typography, styled } from '@mui/material';
import { PermMedia, Send } from '@mui/icons-material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { createLocalStorage } from 'utils/createLocalStorage';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledOuterContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4),
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(2),
}));

const StyledBtnContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        display: 'flex',
        flexDirection: 'column',
    },
}));

const StyledBtn = styled(Button)(({ theme }) => ({
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
        marginRight: 0,
        marginBottom: theme.spacing(1),
    },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
}));

const StyledFlexBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        display: 'flex',
        flexDirection: 'column',
    },
}));

const StyledIconWrapper = styled(Box)(({ theme }) => ({
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
}));

const StyledLink = styled('a')(({ theme }) => ({
    textDecoration: 'none',
}));

export const ProjectDoraFeedback = () => {
    const { trackEvent } = usePlausibleTracker();
    const { value, setValue } = createLocalStorage(
        `project:metrics:plausible`,
        { sent: false },
    );
    const [metrics, setMetrics] = useState(value);

    useEffect(() => {
        setValue(metrics);
    }, [metrics]);

    const onBtnClick = (type: string) => {
        try {
            trackEvent('project-metrics', {
                props: {
                    eventType: type,
                },
            });

            if (!metrics.sent) {
                setMetrics({ sent: true });
            }
        } catch (e) {
            console.error('error sending metrics');
        }
    };

    const recipientEmail = 'ux@getunleash.io';
    const emailSubject = "I'd like to get involved";
    const emailBody = `Hello Unleash,\n\nI just saw the new metrics page you are experimenting with in Unleash. I'd like to be involved in user tests and give my feedback on this feature.\n\nRegards,\n`;

    const mailtoURL = `mailto:${recipientEmail}?subject=${encodeURIComponent(
        emailSubject,
    )}&body=${encodeURIComponent(emailBody)}`;

    return (
        <StyledOuterContainer>
            <StyledHeader variant='h1'>
                We are trying something experimental!
            </StyledHeader>
            <Typography>
                We are considering adding project metrics to see how a project
                performs. As a first step, we have added a{' '}
                <i>lead time for changes</i> indicator that is calculated per
                feature toggle based on the creation of the feature toggle and
                when it was first turned on in an environment of type
                production.
            </Typography>

            <br />

            <Typography>
                DORA is a method for measuring the performance of your DevOps
                teams. It measures four different metrics. You can read Google's
                blog post about{' '}
                <a
                    href='https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    DORA metrics
                </a>{' '}
                for more information.
            </Typography>

            <ConditionallyRender
                condition={!metrics.sent}
                show={
                    <StyledBtnContainer>
                        {' '}
                        <Typography>Is this useful to you?</Typography>
                        <StyledBtnContainer>
                            <StyledBtn
                                variant='contained'
                                color='primary'
                                onClick={() => onBtnClick('useful')}
                            >
                                Yes, I like the direction
                            </StyledBtn>
                            <Button
                                variant='outlined'
                                color='primary'
                                onClick={() => onBtnClick('not useful')}
                            >
                                No, I don't see value in this
                            </Button>
                        </StyledBtnContainer>
                    </StyledBtnContainer>
                }
                elseShow={
                    <Typography
                        sx={(theme) => ({ marginTop: theme.spacing(3) })}
                    >
                        Thank you for the feedback. Feel free to check out the
                        sketches and leave comments, or get in touch with our UX
                        team if you'd like to be involved in usertests and the
                        development of this feature.
                    </Typography>
                }
            />

            <StyledDivider />
            <StyledFlexBox>
                <StyledFlexBox>
                    <StyledIconWrapper>
                        <PermMedia />
                    </StyledIconWrapper>
                    <StyledLink
                        href='https://app.mural.co/t/unleash2757/m/unleash2757/1694006366166/fae4aa4f796de214bdb3ae2d5ce9de934b68fdfb?sender=u777a1f5633477c329eae3448'
                        target='_blank'
                        rel='noopener noreferer'
                    >
                        View sketches
                    </StyledLink>
                </StyledFlexBox>

                <StyledFlexBox>
                    <StyledIconWrapper>
                        <Send />
                    </StyledIconWrapper>
                    <StyledLink href={mailtoURL}>
                        Get involved with our UX team
                    </StyledLink>
                </StyledFlexBox>
            </StyledFlexBox>
        </StyledOuterContainer>
    );
};

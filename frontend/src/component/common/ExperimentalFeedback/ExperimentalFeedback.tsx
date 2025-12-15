import { useState, useEffect } from 'react';
import { Box, Button, Divider, Typography, styled } from '@mui/material';
import PermMedia from '@mui/icons-material/PermMedia';
import Send from '@mui/icons-material/Send';
import {
    type CustomEvents,
    usePlausibleTracker,
} from 'hooks/usePlausibleTracker';
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

interface IExperimentalFeedbackProps {
    trackerKey: string;
    eventKey: CustomEvents;
    description: string;
    sketchURL: string;
}

export const ExperimentalFeedback: React.FC<IExperimentalFeedbackProps> = ({
    trackerKey,
    eventKey,
    description,
    sketchURL,
}) => {
    const { trackEvent } = usePlausibleTracker();
    const { value, setValue } = createLocalStorage(trackerKey, { sent: false });
    const [metrics, setMetrics] = useState(value);

    useEffect(() => {
        setValue(metrics);
    }, [metrics]);

    const onBtnClick = (type: string) => {
        try {
            trackEvent(eventKey, {
                props: {
                    eventType: type,
                },
            });

            if (!metrics.sent) {
                setMetrics({ sent: true });
            }
        } catch (_e) {
            console.error('error sending metrics');
        }
    };

    const recipientEmail = 'ux@getunleash.io';
    const emailSubject = "I'd like to get involved";
    const emailBody = `Hello Unleash,\n\nI just saw your ${eventKey} experiment. I'd like to be involved in user tests and give my feedback on this feature.\n\nRegards,\n`;

    const mailtoURL = `mailto:${recipientEmail}?subject=${encodeURIComponent(
        emailSubject,
    )}&body=${encodeURIComponent(emailBody)}`;

    return (
        <StyledOuterContainer>
            <StyledHeader variant='h1'>
                We are trying something experimental!
            </StyledHeader>
            <Typography>{description}</Typography>

            <br />

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
                        href={sketchURL}
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

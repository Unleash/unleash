import {
    Box,
    Button,
    Dialog,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import { type ComponentType, useEffect, useRef, useState } from 'react';
import { SignupDialogSetPassword } from './SignupDialogSetPassword/SignupDialogSetPassword.tsx';
import { SignupDialogAccountDetails } from './SignupDialogAccountDetails.tsx';
import { SignupDialogInviteOthers } from './SignupDialogInviteOthers.tsx';
import { type SignupData, useSignup } from '../hooks/useSignup.ts';
import { type SubmitSignupData, useSignupApi } from '../hooks/useSignupApi.ts';
import useToast from 'hooks/useToast.tsx';
import { formatUnknownError } from 'utils/formatUnknownError.ts';
import textureImage from 'assets/img/texture-signup.png';
import { ReactComponent as Heart } from 'assets/icons/heart.svg';
import { formatAssetPath } from 'utils/formatPath.ts';
import { SignupDialogComplete } from './SignupDialogComplete.tsx';
import { useWelcomeDialogContext } from 'component/personalDashboard/WelcomeDialogContext.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker.ts';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '.MuiBackdrop-root': {
        backdropFilter: 'blur(8px)',
    },
    '& .MuiDialog-paper': {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        [theme.breakpoints.down('md')]: {
            gridTemplateColumns: '1fr',
        },
    },
    padding: theme.spacing(8),
    [theme.breakpoints.down('md')]: {
        padding: 0,
    },
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const StyledAside = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'hidden',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const StyledHearts = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
}));

const StyledBackgroundTexture = styled('img')({
    objectFit: 'cover',
    position: 'absolute',
    bottom: 0,
    right: 0,
    pointerEvents: 'none',
    filter: 'brightness(1.3)',
    opacity: 0.6,
});

const StyledHeartWrapper = styled(Box)({
    animation: 'heartEnter 300ms ease-out',
    '@keyframes heartEnter': {
        '0%': {
            opacity: 0,
            transform: 'scale(0.7)',
        },
        '100%': {
            opacity: 1,
            transform: 'scale(1)',
        },
    },
});

const StyledHeart = styled(Heart)(({ theme }) => ({
    width: theme.spacing(10),
    height: theme.spacing(10),
    color: theme.palette.primary.contrastText,
    animation: 'float 6s ease-in-out infinite',
    '@keyframes float': {
        '0%': {
            transform: 'translateY(0) scale(1)',
        },
        '50%': {
            transform: 'translateY(-16px) scale(1.1)',
        },
        '100%': {
            transform: 'translateY(0) scale(1)',
        },
    },
}));

const StyledBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(4, 10),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    maxWidth: theme.spacing(70),
    margin: 'auto',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(3),
    width: '100%',
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
    fontSize: theme.typography.h1.fontSize,
}));

const StyledContent = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'start',
    gap: theme.spacing(3),
}));

export const StyledSignupDialogField = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: '100%',
}));

export const StyledSignupDialogLabel = styled('span')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

export const StyledSignupDialogTextField = styled(TextField)(({ theme }) => ({
    '& .MuiFormHelperText-root': {
        marginLeft: 0,
        marginTop: theme.spacing(1),
    },
}));

export const StyledSignupDialogButton = styled(Button)({
    width: '100%',
});

const getHeartAnimationDelay = (i: number) => {
    const delays = ['0s', '-1.5s', '-3s', '-4.5s'];
    return delays[i % 4];
};

export type SignupStepContent = ComponentType<{
    data: SubmitSignupData;
    setData: React.Dispatch<React.SetStateAction<SubmitSignupData>>;
    onBack?: () => void;
    onNext: () => void;
    signupData?: SignupData;
    isSubmitting?: boolean;
}>;

type SignupStep = {
    title:
        | 'Set password'
        | 'Set up your account'
        | 'Invite your team'
        | `You're all set`;
    description?: string;
    content: SignupStepContent;
    show?: (signupData?: SignupData) => boolean;
    isCustom?: boolean;
};

const SIGNUP_STEPS: SignupStep[] = [
    {
        title: 'Set password',
        description: `Create a secure password, and you're good to go!`,
        content: SignupDialogSetPassword,
        show: (signupData?: SignupData) =>
            Boolean(signupData?.shouldSetPassword),
    },
    {
        title: 'Set up your account',
        description: `Let's configure your platform to best fit your needs.`,
        content: SignupDialogAccountDetails,
    },
    {
        title: 'Invite your team',
        description:
            'Bring your teammates on board to collaborate on feature flags and evaluate Unleash together.\nYou can always invite more people later.',
        content: SignupDialogInviteOthers,
    },
    {
        title: `You're all set`,
        content: SignupDialogComplete,
        isCustom: true,
    },
];

export const SignupDialog = () => {
    const { trackEvent } = usePlausibleTracker();
    const { setToastApiError } = useToast();
    const { setWelcomeDialog } = useWelcomeDialogContext();
    const { signupData, signupRequired, refetch } = useSignup();
    const { submitSignupData } = useSignupApi();

    const [data, setData] = useState<SubmitSignupData>({
        password: '',
        name: '',
        companyRole: '',
        companyName: '',
        companyIsNA: false,
        productUpdatesEmailConsent: false,
        inviteEmails: [],
    });
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hydratedRef = useRef(false);

    const steps = SIGNUP_STEPS.filter(({ show }) => !show || show(signupData));
    const safeStep = Math.min(step, steps.length - 1);
    const currentStep = steps[safeStep];

    useEffect(() => {
        if (currentStep?.title) {
            trackEvent('signup-dialog', {
                props: {
                    eventType: 'view',
                    step: currentStep.title,
                },
            });
        }
    }, [currentStep?.title, trackEvent]);

    useEffect(() => {
        if (!signupData || hydratedRef.current) return;

        hydratedRef.current = true;

        setData({
            password: '',
            name: signupData.name ?? '',
            companyRole: signupData.companyRole ?? '',
            companyName: signupData.companyName ?? '',
            companyIsNA: signupData.companyIsNA ?? false,
            productUpdatesEmailConsent:
                signupData.productUpdatesEmailConsent ?? false,
            inviteEmails: [],
        });
    }, [signupData]);

    if (!signupRequired || steps.length === 0 || !currentStep) return null;

    const StepContent = currentStep.content;

    const onBack = () => {
        if (isSubmitting) return;
        if (safeStep === 0) return;
        setStep(safeStep - 1);
    };

    const onNext = async () => {
        if (isSubmitting) return;

        if (safeStep < steps.length - 1) {
            let eventType = 'next';
            if (currentStep.title === 'Invite your team') {
                eventType = data.inviteEmails.length ? 'invite' : 'later';
            }
            trackEvent('signup-dialog', {
                props: {
                    eventType,
                    step: currentStep.title,
                },
            });

            setStep(safeStep + 1);
            return;
        }

        try {
            trackEvent('signup-dialog', {
                props: {
                    eventType: 'complete',
                    step: currentStep.title,
                    totalInvitedEmails: data.inviteEmails.length,
                },
            });

            setIsSubmitting(true);
            await submitSignupData(data);
            refetch();
            setWelcomeDialog('open');
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <StyledDialog open fullScreen>
            <StyledAside>
                <StyledBackgroundTexture
                    src={formatAssetPath(textureImage)}
                    alt=''
                />
                <StyledHearts>
                    {Array.from({
                        length: safeStep + 1 + data.inviteEmails.length,
                    }).map((_, i) => (
                        <StyledHeartWrapper key={i}>
                            <StyledHeart
                                sx={{
                                    animationDelay: getHeartAnimationDelay(i),
                                }}
                            />
                        </StyledHeartWrapper>
                    ))}
                </StyledHearts>
            </StyledAside>
            <StyledBody>
                {!currentStep.isCustom && (
                    <StyledHeader>
                        <StyledTitle>{currentStep.title}</StyledTitle>
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ whiteSpace: 'pre-line' }}
                        >
                            {currentStep.description}
                        </Typography>
                    </StyledHeader>
                )}
                <StyledContent>
                    <StepContent
                        data={data}
                        setData={setData}
                        onBack={onBack}
                        onNext={onNext}
                        signupData={signupData}
                        isSubmitting={isSubmitting}
                    />
                </StyledContent>
            </StyledBody>
        </StyledDialog>
    );
};

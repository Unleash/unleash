import {
    Box,
    Button,
    Dialog,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import UnleashLogo from 'assets/img/unleash_logo_dark_no_label.svg?react';
import UnleashLogoWhite from 'assets/img/unleash_logo_white_no_label.svg?react';
import { ThemeMode } from '../../common/ThemeMode/ThemeMode.tsx';
import { type ComponentType, useEffect, useRef, useState } from 'react';
import { SignupDialogSetPassword } from './SignupDialogSetPassword/SignupDialogSetPassword.tsx';
import { SignupDialogAccountDetails } from './SignupDialogAccountDetails.tsx';
import { SignupDialogInviteOthers } from './SignupDialogInviteOthers.tsx';
import { type SignupData, useSignup } from '../hooks/useSignup.ts';
import { type SubmitSignupData, useSignupApi } from '../hooks/useSignupApi.ts';
import useToast from 'hooks/useToast.tsx';
import { formatUnknownError } from 'utils/formatUnknownError.ts';

const StyledUnleashLogoWhite = styled(UnleashLogoWhite)({
    height: '56px',
    width: '56px',
});
const StyledUnleashLogo = styled(UnleashLogo)({
    height: '56px',
    width: '56px',
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
    zIndex: theme.zIndex.modal + 2,
    '.MuiBackdrop-root': {
        backdropFilter: 'blur(8px)',
    },
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusMedium,
        width: '65vw',
        background: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const StyledBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(4),
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
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

export type SignupStepContent = ComponentType<{
    data: SubmitSignupData;
    setData: React.Dispatch<React.SetStateAction<SubmitSignupData>>;
    onNext: () => void;
    signupData?: SignupData;
    isSubmitting?: boolean;
}>;

type SignupStep = {
    title: 'Set password' | 'Set up your account' | 'Invite others to join';
    description: string;
    content: SignupStepContent;
    nextText?: string;
    show?: (signupData?: SignupData) => boolean;
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
        description: 'Tell us a few more details to get started.',
        content: SignupDialogAccountDetails,
    },
    {
        title: 'Invite others to join',
        description: 'Help us make Unleash better for you.',
        content: SignupDialogInviteOthers,
    },
];

export const SignupDialog = () => {
    const { setToastApiError } = useToast();
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

    const steps = SIGNUP_STEPS.filter(({ show }) => !show || show(signupData));

    useEffect(() => {
        if (steps.length === 0) return;
        setStep((s) => Math.min(s, steps.length - 1));
    }, [steps.length]);

    const currentStep = steps[step];
    const StepContent = currentStep.content;

    const onNext = async () => {
        if (isSubmitting) return;

        if (step < steps.length - 1) {
            setStep(step + 1);
            return;
        }

        try {
            setIsSubmitting(true);
            await submitSignupData(data);
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!signupRequired || steps.length === 0) return null;

    return (
        <StyledDialog open>
            <StyledBody>
                <StyledHeader>
                    <ThemeMode
                        darkmode={<StyledUnleashLogoWhite />}
                        lightmode={<StyledUnleashLogo />}
                    />
                    <StyledTitle>{currentStep.title}</StyledTitle>
                    <Typography variant='body2'>
                        {currentStep.description}
                    </Typography>
                </StyledHeader>
                <StyledContent>
                    <StepContent
                        data={data}
                        setData={setData}
                        onNext={onNext}
                        signupData={signupData}
                        isSubmitting={isSubmitting}
                    />
                </StyledContent>
            </StyledBody>
        </StyledDialog>
    );
};

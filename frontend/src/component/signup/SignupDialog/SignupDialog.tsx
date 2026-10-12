import { Box, Button, styled, TextField } from '@mui/material';
import { type ComponentType, useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import { SignupDialogSetPassword } from './SignupDialogSetPassword/SignupDialogSetPassword.tsx';
import { SignupDialogAccountDetails } from './SignupDialogAccountDetails.tsx';
import { SignupDialogInviteOthers } from './SignupDialogInviteOthers.tsx';
import { useIntro } from 'component/onboarding/intro/IntroProvider.tsx';
import { type SignupData, useSignup } from '../hooks/useSignup.ts';
import { type SubmitSignupData, useSignupApi } from '../hooks/useSignupApi.ts';
import useToast from 'hooks/useToast.tsx';
import { formatUnknownError } from 'utils/formatUnknownError.ts';
import { SignupDialogComplete } from './SignupDialogComplete.tsx';
import { SignupDialogLayout } from './SignupDialogLayout.tsx';
import { useEventTracker } from 'hooks/useEventTracker.ts';
import {
    DEFAULT_PROJECT_ID,
    useDefaultProjectId,
} from 'hooks/api/getters/useDefaultProject/useDefaultProjectId.ts';
import AccessContext from 'contexts/AccessContext.ts';

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

export type SignupStepProps = {
    data: SubmitSignupData;
    setData: React.Dispatch<React.SetStateAction<SubmitSignupData>>;
    onBack?: () => void;
    onNext: (eventType?: string) => void;
    signupData?: SignupData;
    isSubmitting?: boolean;
    error?: string;
};

export type SignupStepContent = ComponentType<SignupStepProps>;

export const initialSignupData: SubmitSignupData = {
    password: '',
    name: '',
    companyRole: '',
    companyName: '',
    companyIsNA: false,
    productUpdatesEmailConsent: false,
    inviteEmails: [],
};

type SignupStep = {
    title:
        | 'Set password'
        | 'Set up your account'
        | 'Invite your team'
        | `You're all set`;
    description?: string;
    content: SignupStepContent;
    show?: (signupData?: SignupData) => boolean;
    adminOnly?: boolean;
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
        adminOnly: true,
    },
    {
        title: `You're all set`,
        content: SignupDialogComplete,
        isCustom: true,
    },
];

export const getSignupSteps = (
    signupData: SignupData | undefined,
    isAdmin: boolean,
) =>
    SIGNUP_STEPS.filter(({ show, adminOnly }) => {
        if (adminOnly && !isAdmin) {
            return false;
        }

        if (show && !show(signupData)) {
            return false;
        }

        return true;
    });

export const SignupDialog = () => {
    const { trackEvent } = useEventTracker();
    const { setToastApiError } = useToast();
    const { signupData, signupRequired, refetch } = useSignup();
    const { submitSignupData } = useSignupApi();
    const navigate = useNavigate();
    const defaultProjectId = useDefaultProjectId();
    const { open: openIntro } = useIntro();
    const { isAdmin } = useContext(AccessContext);

    const [data, setData] = useState<SubmitSignupData>(initialSignupData);
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const steps = getSignupSteps(signupData, isAdmin);
    const safeStep = Math.min(step, steps.length - 1);
    const currentStep = steps[safeStep];

    const isVisible = signupRequired && steps.length > 0 && currentStep;

    if (!isVisible) return null;

    const StepContent = currentStep.content;

    const onBack = () => {
        if (isSubmitting) return;
        if (safeStep === 0) return;

        trackEvent('signup-dialog', {
            props: {
                eventType: 'back',
                step: currentStep.title,
            },
        });

        setStep(safeStep - 1);
    };

    const onNext = async (eventType = 'next') => {
        if (isSubmitting) return;

        trackEvent('signup-dialog', {
            props: {
                eventType,
                step: currentStep.title,
                ...(eventType === 'invite' && {
                    totalInvitedEmails: data.inviteEmails.length,
                }),
            },
        });

        if (safeStep < steps.length - 1) {
            setStep(safeStep + 1);
            return;
        }

        try {
            setIsSubmitting(true);
            await submitSignupData(data);
            refetch();
            navigate(`/projects/${defaultProjectId ?? DEFAULT_PROJECT_ID}`);
            if (eventType === 'tour') {
                openIntro();
            }
        } catch (e: unknown) {
            const error = formatUnknownError(e);
            setToastApiError(error);
            setError(error);

            trackEvent('signup-dialog-error', { props: { error } });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SignupDialogLayout
            hearts={safeStep + 1 + data.inviteEmails.length}
            title={currentStep.title}
            description={currentStep.description}
            isCustom={currentStep.isCustom}
        >
            <StepContent
                data={data}
                setData={setData}
                onBack={onBack}
                onNext={onNext}
                signupData={signupData}
                isSubmitting={isSubmitting}
                error={error}
            />
        </SignupDialogLayout>
    );
};

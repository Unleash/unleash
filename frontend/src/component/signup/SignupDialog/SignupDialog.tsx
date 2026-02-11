import {
    Box,
    Button,
    Dialog,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import { ReactComponent as UnleashLogo } from 'assets/img/unleash_logo_dark_no_label.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/unleash_logo_white_no_label.svg';
import { ThemeMode } from '../../common/ThemeMode/ThemeMode.tsx';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus.ts';
import { type ComponentType, useState } from 'react';
import { SignupDialogSetPassword } from './SignupDialogSetPassword/SignupDialogSetPassword.tsx';
import { SignupDialogAccountDetails } from './SignupDialogAccountDetails.tsx';
import { SignupDialogInviteOthers } from './SignupDialogInviteOthers.tsx';

const StyledUnleashLogoWhite = styled(UnleashLogoWhite)({
    height: '56px',
    width: '56px',
});
const StyledUnleashLogo = styled(UnleashLogo)({
    height: '56px',
    width: '56px',
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '.MuiBackdrop-root': {
        backdropFilter: 'blur(8px)',
    },
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusMedium,
        width: '65vw',
        maxWidth: '1800px',
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

export const StyledSignupDialogLabel = styled('label')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

export const StyledSignupDialogTextField = styled(TextField)(({ theme }) => ({
    '& .MuiFormHelperText-root': {
        marginLeft: 0,
        marginTop: theme.spacing(1),
    },
}));

export const StyledSignupDialogButton = styled(Button)(({ theme }) => ({
    width: '100%',
}));

export type SignupData = {
    password: string;
    firstName: string;
    lastName: string;
    companyRole: string;
    companyName: string;
    companyIsNA: boolean;
    emailSubscription: boolean;
    inviteEmails: string[];
};

export type SignupStepContent = ComponentType<{
    data: SignupData;
    setData: React.Dispatch<React.SetStateAction<SignupData>>;
    onNext: () => void;
}>;

type SignupStep = {
    title: string;
    description: string;
    content: SignupStepContent;
    nextText?: string;
};

const steps: SignupStep[] = [
    {
        title: 'Set password',
        description: `Create a secure password, and you're good to go!`,
        content: SignupDialogSetPassword,
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
    // TODO: Add something to instanceStatus telling us we're signing up, which will control the open state
    // biome-ignore lint/correctness/noUnusedVariables: WIP
    const { instanceStatus } = useInstanceStatus();
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<SignupData>({
        password: '',
        firstName: '',
        lastName: '',
        companyRole: '',
        companyName: '',
        companyIsNA: false,
        emailSubscription: false,
        inviteEmails: [],
    });

    const [step, setStep] = useState(0);
    const currentStep = steps[step];
    const StepContent = currentStep.content;

    const onNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
            return;
        }

        // TODO: Submit data to backend
        setOpen(false);
    };

    return (
        <StyledDialog open={open}>
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
                    />
                </StyledContent>
            </StyledBody>
        </StyledDialog>
    );
};

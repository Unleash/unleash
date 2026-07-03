import {
    Dialog,
    IconButton,
    styled,
    type Theme,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Confetti from 'react-confetti';
import { Link } from 'react-router';
import CodeBlockIcon from 'assets/icons/code-block.svg?react';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { formatCreateStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { getOnboardingEnvironment } from '../flow/steps/getOnboardingEnvironment.ts';

interface IOnboardingCelebrationDialogProps {
    projectId: string;
    open: boolean;
    onClose: () => void;
    onConnectSdk: () => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusExtraLarge,
        maxWidth: theme.spacing(90),
        padding: theme.spacing(4),
    },
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
    color: theme.palette.neutral.main,
}));

const Headline = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.largeHeader,
    fontWeight: theme.fontWeight.bold,
    marginRight: theme.spacing(4),
}));

const Subtitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
}));

const NextSteps = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const cardStyles = (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    padding: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.default,
    textAlign: 'left' as const,
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        background: theme.palette.background.elevation1,
    },
});

const CardLink = styled(Link)(({ theme }) => cardStyles(theme));

const CardButton = styled('button')(({ theme }) => ({
    ...cardStyles(theme),
    fontFamily: 'inherit',
}));

const CardIcon = styled('div')(({ theme }) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '& svg': { fontSize: 20 },
    '& svg path': { fill: 'currentColor' },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const CardBody = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

export const OnboardingCelebrationDialog = ({
    projectId,
    open,
    onClose,
    onConnectSdk,
}: IOnboardingCelebrationDialogProps) => {
    const { features } = useFeatureSearch({
        project: `IS:${projectId}`,
    });
    const firstFeature = features[0];
    const environment = getOnboardingEnvironment(firstFeature);

    const gradualRolloutPath =
        firstFeature && environment
            ? formatCreateStrategyPath(
                  projectId,
                  firstFeature.name,
                  environment.name,
                  'flexibleRollout',
              )
            : `/projects/${projectId}`;

    return (
        <>
            {open ? (
                <Confetti
                    recycle={false}
                    numberOfPieces={1000}
                    initialVelocityY={50}
                    gravity={0.3}
                    style={{ zIndex: 3000 }}
                />
            ) : null}
            <StyledDialog
                open={open}
                onClose={onClose}
                aria-labelledby='onboarding-celebration-headline'
            >
                <StyledCloseButton aria-label='close' onClick={onClose}>
                    <CloseIcon />
                </StyledCloseButton>
                <Headline id='onboarding-celebration-headline'>
                    Your flag is live 🎉
                </Headline>
                <Subtitle>
                    Your app just changed behavior — no deploy needed. Here are
                    some great next steps.
                </Subtitle>
                <NextSteps>
                    <CardLink to={gradualRolloutPath} onClick={onClose}>
                        <CardIcon>
                            <TrendingUpIcon />
                        </CardIcon>
                        <CardTitle>Add a gradual rollout</CardTitle>
                        <CardBody>
                            Release to a percentage of your users instead of
                            everyone at once.
                        </CardBody>
                    </CardLink>
                    <CardButton
                        type='button'
                        onClick={() => {
                            onClose();
                            onConnectSdk();
                        }}
                    >
                        <CardIcon>
                            <CodeBlockIcon />
                        </CardIcon>
                        <CardTitle>Connect your SDK</CardTitle>
                        <CardBody>
                            See the flag evaluated live in your own application.
                        </CardBody>
                    </CardButton>
                    <CardLink to='/admin/invite-link' onClick={onClose}>
                        <CardIcon>
                            <PersonAddOutlinedIcon />
                        </CardIcon>
                        <CardTitle>Invite a teammate</CardTitle>
                        <CardBody>
                            Feature flags are better together. Share what you
                            just built.
                        </CardBody>
                    </CardLink>
                </NextSteps>
            </StyledDialog>
        </>
    );
};

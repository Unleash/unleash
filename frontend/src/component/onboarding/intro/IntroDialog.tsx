import { Dialog, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useUiFlag } from 'hooks/useUiFlag';
import { Intro } from './Intro.tsx';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(180),
        width: '100%',
        height: '90vh',
        maxHeight: `calc(100vh - ${theme.spacing(6)})`,
        overflow: 'hidden',
        // On smaller screens the intro panel drops its two-column layout and
        // stacks past the viewport - let the paper scroll instead of clipping.
        [theme.breakpoints.down('md')]: {
            height: '100%',
            maxHeight: '100vh',
            borderRadius: 0,
            overflow: 'auto',
        },
    },
}));

const StyledClose = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
    width: 28,
    height: 28,
    padding: theme.spacing(0.5),
    borderRadius: '50%',
    color: theme.palette.text.secondary,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

interface IIntroDialogProps {
    open: boolean;
    onClose: () => void;
    onExited: () => void;
    onFinish: () => void;
}

/**
 * The intro as a large centered dialog floating over the dimmed app.
 * Backdrop click, Escape, the close button, and Skip/Finish all close it.
 * Rendered once at App level by {@link IntroProvider}; opened via
 * {@link useIntro}.
 */
export const IntroDialog = ({
    open,
    onClose,
    onExited,
    onFinish,
}: IIntroDialogProps) => {
    const navigate = useNavigate();
    const advancedStepsEnabled = useUiFlag('onboardingIntroTourAdvancedTopics');
    const { projects } = useProjects({ isPaused: () => !open });

    const handleComplete = () => {
        onClose();
        navigate(
            projects.length === 1 ? `/projects/${projects[0].id}` : '/projects',
        );
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{ transition: { onExited } }}
        >
            <StyledClose onClick={onClose} aria-label='Close' size='small'>
                <CloseIcon fontSize='small' />
            </StyledClose>
            <Intro
                onComplete={handleComplete}
                onFinish={onFinish}
                advancedStepsEnabled={advancedStepsEnabled}
            />
        </StyledDialog>
    );
};

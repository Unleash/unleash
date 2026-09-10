import {
    Box,
    Button,
    ClickAwayListener,
    Grow,
    IconButton,
    Paper,
    Popper,
    styled,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { darkTheme } from 'themes/dark-theme';

const ARROW_SIZE = 7;

const AnnouncementPopper = styled(Popper)(({ theme }) => ({
    zIndex: theme.zIndex.tooltip,
}));

const AnnouncementPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(2),
    maxWidth: 310,
    maxHeight: 162,
    color: theme.palette.common.white,
    backgroundColor: darkTheme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.popup,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -ARROW_SIZE,
        right: theme.spacing(2),
        width: 0,
        height: 0,
        borderLeft: `${ARROW_SIZE}px solid transparent`,
        borderRight: `${ARROW_SIZE}px solid transparent`,
        borderBottom: `${ARROW_SIZE}px solid ${darkTheme.palette.background.paper}`,
    },
}));

const TitleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h3.fontSize,
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.common.white,
    padding: theme.spacing(0.25),
    marginTop: theme.spacing(-0.5),
    marginRight: theme.spacing(-0.5),
}));

const StyledBody = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(0.5),
    color: theme.palette.common.white,
}));

const StyledHelpAccent = styled('span')(({ theme }) => ({
    color: theme.palette.primary.light,
    fontWeight: theme.typography.fontWeightBold,
}));

const Actions = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
}));

const DismissButton = styled(Button)(({ theme }) => ({
    color: theme.palette.common.white,
    fontWeight: theme.typography.fontWeightBold,
}));

interface HelpMenuAnnouncementProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onDismiss: () => void;
    onClose: () => void;
}

export const HelpMenuAnnouncement = ({
    open,
    anchorEl,
    onDismiss,
    onClose,
}: HelpMenuAnnouncementProps) => (
    <AnnouncementPopper
        open={open}
        anchorEl={anchorEl}
        placement='bottom-end'
        transition
    >
        {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={onClose}>
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: 'top right' }}
                    timeout={200}
                >
                    <AnnouncementPaper elevation={0}>
                        <TitleRow>
                            <StyledTitle variant='h2'>
                                All your help, in one place
                            </StyledTitle>
                            <StyledCloseButton
                                size='small'
                                aria-label='Dismiss'
                                onClick={onDismiss}
                            >
                                <CloseIcon fontSize='small' />
                            </StyledCloseButton>
                        </TitleRow>
                        <StyledBody variant='body2'>
                            Documentation, Learning Lab, Slack community,
                            GitHub, and feedback now under the{' '}
                            <StyledHelpAccent>? icon</StyledHelpAccent>
                        </StyledBody>
                        <Actions>
                            <Button
                                variant='contained'
                                color='primary'
                                size='medium'
                                onClick={onDismiss}
                            >
                                Got it
                            </Button>
                            <DismissButton
                                variant='text'
                                color='inherit'
                                size='medium'
                                onClick={onDismiss}
                            >
                                Dismiss
                            </DismissButton>
                        </Actions>
                    </AnnouncementPaper>
                </Grow>
            </ClickAwayListener>
        )}
    </AnnouncementPopper>
);

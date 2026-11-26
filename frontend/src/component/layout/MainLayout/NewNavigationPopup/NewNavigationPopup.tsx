import { useId } from 'react';
import {
    Box,
    Button,
    IconButton,
    Paper,
    SvgIcon,
    Typography,
    styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SideNavigationIcon from 'assets/icons/menu/side-navigation.svg?react';
import { useNewNavigation } from 'hooks/useNewNavigation';

const StyledPopup = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.appBar - 1,
    width: 420,
    maxWidth: `calc(100vw - ${theme.spacing(6)})`,
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
    // Inverted surface, so the popup stands out against the page in both themes.
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.paper,
    boxShadow: theme.boxShadows.popup,
}));

const StyledIcon = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexShrink: 0,
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.primary.container,
    color: theme.palette.primary.onContainer,
}));

const StyledContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    flex: 1,
    minWidth: 0,
}));

const StyledTitle = styled(Typography)({
    lineHeight: 2,
});

const StyledDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    opacity: 0.8,
}));

const StyledActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const StyledCloseButton = styled(IconButton)({
    color: 'inherit',
    opacity: 0.8,
});

export const NewNavigationPopup = () => {
    const titleId = useId();
    const { showPopup, dismissPopup, setEnabled } = useNewNavigation();

    if (!showPopup) {
        return null;
    }

    return (
        <StyledPopup role='region' aria-labelledby={titleId} elevation={0}>
            <StyledIcon>
                <SvgIcon component={SideNavigationIcon} inheritViewBox />
            </StyledIcon>
            <StyledContent>
                <StyledTitle id={titleId} variant='h2'>
                    New layout available
                </StyledTitle>
                <StyledDescription>
                    Simpler navigation and room for new features. You can switch
                    back any time.
                </StyledDescription>
                <StyledActions>
                    <Button
                        variant='contained'
                        onClick={() => setEnabled(true)}
                    >
                        Try it now
                    </Button>
                </StyledActions>
            </StyledContent>
            <StyledCloseButton
                size='small'
                aria-label='Dismiss new layout popup'
                onClick={dismissPopup}
            >
                <CloseIcon fontSize='small' />
            </StyledCloseButton>
        </StyledPopup>
    );
};

import { type FC, type ReactNode, useId } from 'react';
import { Box, IconButton, Paper, Typography, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

const StyledIcon = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: 'primary' | 'success' }>(({ theme, tone }) => ({
    display: 'flex',
    flexShrink: 0,
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette[tone].container,
    color: theme.palette[tone].onContainer,
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

export const NavigationPopup: FC<{
    icon: ReactNode;
    iconTone: 'primary' | 'success';
    title: string;
    description: string;
    actions: ReactNode;
    dismissLabel: string;
    onDismiss: () => void;
}> = ({
    icon,
    iconTone,
    title,
    description,
    actions,
    dismissLabel,
    onDismiss,
}) => {
    const titleId = useId();

    return (
        <StyledPopup role='region' aria-labelledby={titleId} elevation={0}>
            <StyledIcon tone={iconTone}>{icon}</StyledIcon>
            <StyledContent>
                <StyledTitle id={titleId} variant='h2'>
                    {title}
                </StyledTitle>
                <StyledDescription>{description}</StyledDescription>
                <StyledActions>{actions}</StyledActions>
            </StyledContent>
            <StyledCloseButton
                size='small'
                aria-label={dismissLabel}
                onClick={onDismiss}
            >
                <CloseIcon fontSize='small' />
            </StyledCloseButton>
        </StyledPopup>
    );
};

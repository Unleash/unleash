import type { ReactNode } from 'react';
import {
    IconButton,
    ListItem,
    ListItemButton,
    Tooltip,
    styled,
} from '@mui/material';
import Close from '@mui/icons-material/Close';

const StyledItemButton = styled(ListItemButton)(({ theme }) => ({
    justifyContent: 'space-between',
    outline: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1),
}));

const StyledItemButtonContent = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledItemButtonClose = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.25),
}));

interface INewInUnleashItemProps {
    icon: ReactNode;
    onClick: () => void;
    onDismiss: () => void;
    children: ReactNode;
}

export const NewInUnleashItem = ({
    icon,
    onClick,
    onDismiss,
    children,
}: INewInUnleashItemProps) => {
    const onDismissClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDismiss();
    };

    return (
        <ListItem disablePadding onClick={onClick}>
            <StyledItemButton>
                <StyledItemButtonContent>
                    {icon}
                    {children}
                </StyledItemButtonContent>
                <Tooltip title='Dismiss' arrow>
                    <StyledItemButtonClose
                        aria-label='dismiss'
                        onClick={onDismissClick}
                        size='small'
                    >
                        <Close fontSize='inherit' />
                    </StyledItemButtonClose>
                </Tooltip>
            </StyledItemButton>
        </ListItem>
    );
};

import type * as React from 'react';
import { type ReactNode, useState } from 'react';
import {
    IconButton,
    ListItem,
    ListItemButton,
    styled,
    Tooltip,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { NewInUnleashTooltip } from './NewInUnleashTooltip';

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
    label: string;
    longDescription: ReactNode;
    link: string;
    docsLink: string;
}

const useTooltip = () => {
    const [open, setOpen] = useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    return { open, handleTooltipOpen, handleTooltipClose };
};

export const NewInUnleashItem = ({
    icon,
    onClick,
    onDismiss,
    label,
    longDescription,
    link,
    docsLink,
}: INewInUnleashItemProps) => {
    const { open, handleTooltipOpen, handleTooltipClose } = useTooltip();

    const onDismissClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDismiss();
    };

    return (
        <ListItem
            disablePadding
            onClick={() => {
                onClick();
                handleTooltipOpen();
            }}
        >
            <NewInUnleashTooltip
                open={open}
                onClose={handleTooltipClose}
                title={label}
                longDescription={longDescription}
                link={link}
                docsLink={docsLink}
            >
                <StyledItemButton>
                    <StyledItemButtonContent>
                        {icon}
                        {label}
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
            </NewInUnleashTooltip>
        </ListItem>
    );
};

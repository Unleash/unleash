import type * as React from 'react';
import { type ReactNode, useState } from 'react';
import {
    IconButton,
    ListItem,
    ListItemButton,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { NewInUnleashTooltip } from './NewInUnleashTooltip';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';

export type NewInUnleashItemDetails = {
    label: string;
    summary: string;
    icon: ReactNode;
    onCheckItOut?: () => void;
    docsLink?: string;
    show: boolean;
    longDescription: ReactNode;
    preview?: ReactNode;
    beta?: boolean;
};

const StyledItemButton = styled(ListItemButton)(({ theme }) => ({
    outline: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'start',
    gap: theme.spacing(1),
    fontSize: theme.fontSizes.smallBody,
}));

const LabelWithSummary = styled('div')(({ theme }) => ({
    flex: 1,
}));

const StyledItemTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    height: theme.spacing(3),
}));

const StyledItemButtonClose = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.25),
}));

interface INewInUnleashItemProps
    extends Omit<NewInUnleashItemDetails, 'show' | 'beta'> {
    onClick: () => void;
    onDismiss: () => void;
    beta: boolean;
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
    onCheckItOut,
    docsLink,
    preview,
    summary,
    beta,
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
                onCheckItOut={onCheckItOut}
                docsLink={docsLink}
                preview={preview}
                beta={beta}
            >
                <StyledItemButton>
                    {icon}
                    <LabelWithSummary>
                        <StyledItemTitle>
                            <Typography fontWeight='bold' fontSize='small'>
                                {label}
                            </Typography>
                            <ConditionallyRender
                                condition={beta}
                                show={<Badge color='secondary'>Beta</Badge>}
                            />
                        </StyledItemTitle>
                        <Typography fontSize='small'>{summary}</Typography>
                    </LabelWithSummary>
                    <Tooltip title='Dismiss' arrow sx={{ marginLeft: 'auto' }}>
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

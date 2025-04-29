import { type ReactNode, useState } from 'react';
import { ListItem } from '@mui/material';
import { NewInUnleashTooltip } from './NewInUnleashTooltip.tsx';
import { NewInUnleashDialog } from './NewInUnleashDialog.tsx';
import { NewInUnleashSideBarItem } from './NewInUnleashSideBarItem.tsx';

export type NewInUnleashItemDetails = {
    label: string;
    summary: string;
    icon: ReactNode;
    onCheckItOut?: () => void;
    docsLink?: string;
    show: boolean;
    longDescription?: ReactNode;
    preview?: ReactNode;
    beta?: boolean;
    popout?: boolean;
};

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
    popout,
}: INewInUnleashItemProps) => {
    const { open, handleTooltipOpen, handleTooltipClose } = useTooltip();

    const onDismissClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDismiss();
    };

    const onOpen = () => {
        onClick();
        handleTooltipOpen();
    };

    return (
        <ListItem disablePadding>
            {popout ? (
                <>
                    <NewInUnleashDialog
                        open={open}
                        onClose={handleTooltipClose}
                        title={label}
                        longDescription={longDescription}
                        onCheckItOut={onCheckItOut}
                        docsLink={docsLink}
                        preview={preview}
                        beta={beta}
                    />
                    <NewInUnleashSideBarItem
                        label={label}
                        summary={summary}
                        icon={icon}
                        beta={beta}
                        onClick={onOpen}
                        onDismiss={onDismissClick}
                    />
                </>
            ) : (
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
                    <NewInUnleashSideBarItem
                        label={label}
                        summary={summary}
                        icon={icon}
                        beta={beta}
                        onClick={onOpen}
                        onDismiss={onDismissClick}
                    />
                </NewInUnleashTooltip>
            )}
        </ListItem>
    );
};

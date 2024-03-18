import { Box, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Markdown } from 'component/common/Markdown/Markdown';
import type { ReactNode } from 'react';

const StyledMarkdown = styled(Markdown)(({ theme }) => ({
    'h1, h2, h3': {
        margin: theme.spacing(2, 0),
    },
}));

interface IBannerDialogProps {
    title: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: ReactNode;
}

export const BannerDialog = ({
    open,
    setOpen,
    title,
    children,
}: IBannerDialogProps) => {
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialogue
            title={title}
            open={open}
            secondaryButtonText='Close'
            onClose={handleClose}
        >
            <Box
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.nodeName === 'A') {
                        handleClose();
                    }
                }}
            >
                {typeof children === 'string' ? (
                    <StyledMarkdown>{children}</StyledMarkdown>
                ) : (
                    children
                )}
            </Box>
        </Dialogue>
    );
};

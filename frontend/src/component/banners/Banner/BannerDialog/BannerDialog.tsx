import { styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Markdown } from 'component/common/Markdown/Markdown';

const StyledMarkdown = styled(Markdown)(({ theme }) => ({
    'h1, h2, h3': {
        margin: theme.spacing(2, 0),
    },
}));

interface IBannerDialogProps {
    title: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: string;
}

export const BannerDialog = ({
    open,
    setOpen,
    title,
    children,
}: IBannerDialogProps) => {
    return (
        <Dialogue
            title={title}
            open={open}
            secondaryButtonText='Close'
            onClose={() => {
                setOpen(false);
            }}
        >
            <StyledMarkdown>{children}</StyledMarkdown>
        </Dialogue>
    );
};

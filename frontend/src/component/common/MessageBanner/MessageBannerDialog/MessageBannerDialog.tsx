import { styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import ReactMarkdown from 'react-markdown';

const StyledReactMarkdown = styled(ReactMarkdown)(({ theme }) => ({
    'h1, h2, h3': {
        margin: theme.spacing(2, 0),
    },
}));

interface IMessageBannerDialogProps {
    title: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: string;
}

export const MessageBannerDialog = ({
    open,
    setOpen,
    title,
    children,
}: IMessageBannerDialogProps) => {
    return (
        <Dialogue
            title={title}
            open={open}
            secondaryButtonText="Close"
            onClose={() => {
                setOpen(false);
            }}
        >
            <StyledReactMarkdown>{children}</StyledReactMarkdown>
        </Dialogue>
    );
};

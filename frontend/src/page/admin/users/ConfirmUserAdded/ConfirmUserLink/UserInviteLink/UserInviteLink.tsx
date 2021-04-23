import { useState } from 'react';
import { IconButton } from '@material-ui/core';
import CopyIcon from '@material-ui/icons/FileCopy';
import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

interface IInviteLinkProps {
    inviteLink: string;
}

interface ISnackbar {
    show: boolean;
    type: 'success' | 'error';
    text: string;
}

const UserInviteLink = ({ inviteLink }: IInviteLinkProps) => {
    const [snackbar, setSnackbar] = useState<ISnackbar>({
        show: false,
        type: 'success',
        text: '',
    });

    const handleCopy = () => {
        return navigator.clipboard
            .writeText(inviteLink)
            .then(() => {
                setSnackbar({
                    show: true,
                    type: 'success',
                    text: 'Successfully copied invite link.',
                });
            })
            .catch(() => {
                setSnackbar({
                    show: true,
                    type: 'error',
                    text: 'Could not copy invite link.',
                });
            });
    };

    return (
        <div
            style={{
                backgroundColor: '#efefef',
                padding: '2rem',
                borderRadius: '3px',
                margin: '1rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                wordBreak: 'break-all',
            }}
        >
            {inviteLink}
            <IconButton onClick={handleCopy}>
                <CopyIcon />
            </IconButton>
            <Snackbar
                open={snackbar.show}
                autoHideDuration={6000}
                onClose={() =>
                    setSnackbar({ show: false, type: 'success', text: '' })
                }
            >
                <Alert severity={snackbar.type}>{snackbar.text}</Alert>
            </Snackbar>
        </div>
    );
};

export default UserInviteLink;

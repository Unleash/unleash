import { IconButton } from '@material-ui/core';
import CopyIcon from '@material-ui/icons/FileCopy';
import useToast from 'hooks/useToast';

interface IInviteLinkProps {
    inviteLink: string;
}

const UserInviteLink = ({ inviteLink }: IInviteLinkProps) => {
    const { setToastData } = useToast();

    const handleCopy = () => {
        try {
            return navigator.clipboard
                .writeText(inviteLink)
                .then(() => {
                    setToastData({
                        type: 'success',
                        title: 'Successfully copied invite link.',
                    });
                })
                .catch(() => {
                    setError();
                });
        } catch (e) {
            setError();
        }
    };

    const setError = () =>
        setToastData({
            type: 'error',
            title: 'Could not copy invite link.',
        });

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
        </div>
    );
};

export default UserInviteLink;

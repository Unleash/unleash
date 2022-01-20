import { IconButton } from '@material-ui/core';
import CopyIcon from '@material-ui/icons/FileCopy';
import useToast from '../../../../../hooks/useToast';

interface IUserTokenProps {
    token: string;
}

const UserToken = ({ token }: IUserTokenProps) => {
    const { setToastData } = useToast();
    
    const handleCopy = () => {
        try {
            return navigator.clipboard
                .writeText(token)
                .then(() => {
                    setToastData({
                        type: 'success',
                        title: 'Token copied',
                        text: `Token is copied to clipboard`,
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
            title: 'Could not copy token',
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
            {token}
            <IconButton onClick={handleCopy}>
                <CopyIcon />
            </IconButton>
        </div>
    );
};

export default UserToken;

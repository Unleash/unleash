import { IconButton } from '@material-ui/core';
import CopyIcon from '@material-ui/icons/FileCopy';
import copy from 'copy-to-clipboard';
import useToast from '../../../../../hooks/useToast';

interface IUserTokenProps {
    token: string;
}

export const UserToken = ({ token }: IUserTokenProps) => {
    const { setToastData } = useToast();

    const copyToken = () => {
        if (copy(token)) {
            setToastData({
                type: 'success',
                title: 'Token copied',
                text: `Token is copied to clipboard`,
            });
        } else
            setToastData({
                type: 'error',
                title: 'Could not copy token',
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
            {token}
            <IconButton onClick={copyToken}>
                <CopyIcon />
            </IconButton>
        </div>
    );
};

import { Box, IconButton, Tooltip } from '@mui/material';
import CopyIcon from '@mui/icons-material/FileCopy';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import { useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';

interface IUserTokenProps {
    token: string;
    copyTracking?: Tracking;
}

export const UserToken = ({ token, copyTracking }: IUserTokenProps) => {
    const { setToastData } = useToast();
    const { track } = useTracking(copyTracking);

    const copyToken = () => {
        if (copy(token)) {
            track('succeeded');
            setToastData({
                type: 'success',
                text: 'Token copied to clipboard',
            });
        } else {
            track('failed', { failedOn: 'clipboard' });
            setToastData({
                type: 'error',
                text: 'Could not copy token',
            });
        }
    };

    return (
        <Box
            sx={(theme) => ({
                backgroundColor: theme.palette.background.elevation2,
                padding: theme.spacing(4),
                borderRadius: `${theme.shape.borderRadius}px`,
                marginTop: theme.spacing(2),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                wordBreak: 'break-all',
            })}
        >
            {token}
            <Tooltip title='Copy token' arrow>
                <IconButton onClick={copyToken} size='large'>
                    <CopyIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

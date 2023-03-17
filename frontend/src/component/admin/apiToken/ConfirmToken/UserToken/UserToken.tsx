import { Box, IconButton, Tooltip } from '@mui/material';
import CopyIcon from '@mui/icons-material/FileCopy';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';

interface IUserTokenProps {
    token: string;
}

export const UserToken = ({ token }: IUserTokenProps) => {
    const { setToastData } = useToast();

    const copyToken = () => {
        if (copy(token)) {
            setToastData({
                type: 'success',
                title: 'Token copied to clipboard',
            });
        } else
            setToastData({
                type: 'error',
                title: 'Could not copy token',
            });
    };

    return (
        <Box
            sx={theme => ({
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
            <Tooltip title="Copy token" arrow>
                <IconButton onClick={copyToken} size="large">
                    <CopyIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

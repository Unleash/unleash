import { Box, IconButton, Tooltip } from '@mui/material';
import CopyIcon from '@mui/icons-material/FileCopy';
import useToast from 'hooks/useToast';

interface ILinkFieldProps {
    inviteLink: string;
    small?: boolean;
}

export const LinkField = ({ inviteLink, small }: ILinkFieldProps) => {
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
        <Box
            sx={{
                backgroundColor: theme => theme.palette.secondaryContainer,
                py: 4,
                px: 4,
                borderRadius: theme => `${theme.shape.borderRadius}px`,
                my: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                wordBreak: 'break-all',
                ...(small
                    ? {
                          my: 0,
                          py: 0.5,
                          pl: 1.5,
                          pr: 0.5,
                          fontSize: theme => theme.typography.body2.fontSize,
                      }
                    : {}),
            }}
        >
            {inviteLink}
            <Tooltip title="Copy link" arrow>
                <IconButton
                    onClick={handleCopy}
                    size={small ? 'small' : 'large'}
                    sx={small ? { ml: 0.5 } : {}}
                >
                    <CopyIcon sx={{ fontSize: small ? 20 : undefined }} />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

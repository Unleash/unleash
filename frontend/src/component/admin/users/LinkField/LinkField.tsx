import { Box, IconButton, Tooltip } from '@mui/material';
import CopyIcon from '@mui/icons-material/FileCopy';
import useToast from 'hooks/useToast';

interface ILinkFieldProps {
    inviteLink: string;
    small?: boolean;
    successTitle?: string;
    errorTitle?: string;
}

export const LinkField = ({
    inviteLink,
    small,
    successTitle = 'Successfully copied invite link.',
    errorTitle = 'Could not copy invite link.',
}: ILinkFieldProps) => {
    const { setToastData } = useToast();

    const setError = () =>
        setToastData({
            type: 'error',
            title: errorTitle,
        });

    const handleCopy = () => {
        try {
            return navigator.clipboard
                .writeText(inviteLink)
                .then(() => {
                    setToastData({
                        type: 'success',
                        title: successTitle,
                    });
                })
                .catch(() => {
                    setError();
                });
        } catch (e) {
            setError();
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: (theme) => theme.palette.background.elevation2,
                py: 4,
                px: 4,
                borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                mt: 2,
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
                          fontSize: (theme) => theme.typography.body2.fontSize,
                      }
                    : {}),
            }}
        >
            {inviteLink}
            <Tooltip title='Copy link' arrow>
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

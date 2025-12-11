import type { FC } from 'react';
import { Box, IconButton, styled, Tooltip } from '@mui/material';
import CopyIcon from '@mui/icons-material/FileCopy';
import useToast from 'hooks/useToast';

interface ILinkFieldProps {
    inviteLink: string;
    small?: boolean;
    successTitle?: string;
    errorTitle?: string;
    onCopy?: () => void;
    isExpired?: boolean;
}

const StyledBox = styled(Box)<{ isExpired?: boolean; small?: boolean }>(
    ({ theme, small, isExpired }) => ({
        backgroundColor: theme.palette.background.elevation2,
        padding: theme.spacing(4),
        borderRadius: `${theme.shape.borderRadius}px`,
        marginTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        wordBreak: 'break-all',
        ...(small
            ? {
                  marginTop: 0,
                  padding: theme.spacing(0.5, 0.5, 0.5, 1.5),
                  fontSize: theme.typography.body2.fontSize,
              }
            : {}),
        ...(isExpired
            ? {
                  textDecoration: 'line-through',
                  color: theme.palette.text.disabled,
              }
            : {}),
    }),
);

export const LinkField: FC<ILinkFieldProps> = ({
    inviteLink,
    small,
    successTitle = 'Successfully copied invite link.',
    errorTitle = 'Could not copy invite link.',
    onCopy,
    isExpired,
}) => {
    const { setToastData } = useToast();

    const setError = () =>
        setToastData({
            type: 'error',
            text: errorTitle,
        });

    const handleCopy = () => {
        try {
            return navigator.clipboard
                .writeText(inviteLink)
                .then(() => {
                    setToastData({
                        type: 'success',
                        text: successTitle,
                    });
                    onCopy?.();
                })
                .catch(() => {
                    setError();
                });
        } catch (_e) {
            setError();
        }
    };

    return (
        <StyledBox small={small} isExpired={isExpired}>
            {inviteLink}
            <Tooltip title={isExpired ? '' : 'Copy link'} arrow>
                <IconButton
                    onClick={handleCopy}
                    size={small ? 'small' : 'large'}
                    sx={small ? { ml: 0.5 } : {}}
                    disabled={isExpired}
                >
                    <CopyIcon sx={{ fontSize: small ? 20 : undefined }} />
                </IconButton>
            </Tooltip>
        </StyledBox>
    );
};

import { IconButton, Tooltip } from '@mui/material';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import useToast from 'hooks/useToast';
import copy from 'copy-to-clipboard';
import { FileCopy } from '@mui/icons-material';

interface ICopyApiTokenButtonProps {
    token: IApiToken;
}

export const CopyApiTokenButton = ({ token }: ICopyApiTokenButtonProps) => {
    const { setToastData } = useToast();

    const copyToken = (value: string) => {
        if (copy(value)) {
            setToastData({
                type: 'success',
                title: `Token copied to clipboard`,
            });
        }
    };

    return (
        <Tooltip title="Copy token" arrow>
            <IconButton onClick={() => copyToken(token.secret)} size="large">
                <FileCopy />
            </IconButton>
        </Tooltip>
    );
};

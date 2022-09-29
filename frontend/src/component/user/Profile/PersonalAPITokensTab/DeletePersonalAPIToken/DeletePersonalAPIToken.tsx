import { Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { usePersonalAPITokensApi } from 'hooks/api/actions/usePersonalAPITokensApi/usePersonalAPITokensApi';
import { usePersonalAPITokens } from 'hooks/api/getters/usePersonalAPITokens/usePersonalAPITokens';
import useToast from 'hooks/useToast';
import { IPersonalAPIToken } from 'interfaces/personalAPIToken';
import { FC } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IDeletePersonalAPITokenProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    token?: IPersonalAPIToken;
}

export const DeletePersonalAPIToken: FC<IDeletePersonalAPITokenProps> = ({
    open,
    setOpen,
    token,
}) => {
    const { refetchTokens } = usePersonalAPITokens();
    const { deletePersonalAPIToken } = usePersonalAPITokensApi();
    const { setToastData, setToastApiError } = useToast();

    const onRemoveClick = async () => {
        if (token) {
            try {
                await deletePersonalAPIToken(token?.secret);
                refetchTokens();
                setOpen(false);
                setToastData({
                    title: 'Token deleted successfully',
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    return (
        <Dialogue
            open={open}
            primaryButtonText="Delete token"
            secondaryButtonText="Cancel"
            onClick={onRemoveClick}
            onClose={() => {
                setOpen(false);
            }}
            title="Delete token?"
        >
            <Typography>
                Do you really want to delete{' '}
                <strong>{token?.description}</strong>?
            </Typography>
        </Dialogue>
    );
};

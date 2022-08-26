import { DELETE_API_TOKEN } from 'component/providers/AccessProvider/permissions';
import { Delete } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IconButton, Tooltip } from '@mui/material';
import {
    IApiToken,
    useApiTokens,
} from 'hooks/api/getters/useApiTokens/useApiTokens';
import AccessContext from 'contexts/AccessContext';
import { useContext, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';

interface IRemoveApiTokenButtonProps {
    token: IApiToken;
}

export const RemoveApiTokenButton = ({ token }: IRemoveApiTokenButtonProps) => {
    const { hasAccess } = useContext(AccessContext);
    const { deleteToken } = useApiTokensApi();
    const [open, setOpen] = useState(false);
    const { setToastData } = useToast();
    const { refetch } = useApiTokens();

    const onRemove = async () => {
        await deleteToken(token.secret);
        setOpen(false);
        refetch();
        setToastData({
            type: 'success',
            title: 'API token removed',
        });
    };

    return (
        <>
            <ConditionallyRender
                condition={hasAccess(DELETE_API_TOKEN)}
                show={
                    <Tooltip title="Delete token" arrow>
                        <IconButton onClick={() => setOpen(true)} size="large">
                            <Delete />
                        </IconButton>
                    </Tooltip>
                }
            />
            <Dialogue
                open={open}
                onClick={onRemove}
                onClose={() => setOpen(false)}
                title="Confirm deletion"
            >
                <div>
                    Are you sure you want to delete the following API token?
                    <br />
                    <ul>
                        <li>
                            <strong>username</strong>:{' '}
                            <code>{token.username}</code>
                        </li>
                        <li>
                            <strong>type</strong>: <code>{token.type}</code>
                        </li>
                    </ul>
                </div>
            </Dialogue>
        </>
    );
};

import { DELETE_API_TOKEN } from 'component/providers/AccessProvider/permissions';
import { Delete } from '@mui/icons-material';
import { styled } from '@mui/material';
import {
    IApiToken,
    useApiTokens,
} from 'hooks/api/getters/useApiTokens/useApiTokens';
import AccessContext from 'contexts/AccessContext';
import { useContext, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import { DELETE_PROJECT_API_TOKEN } from '@server/types';
import PermissionIconButton from '../../../common/PermissionIconButton/PermissionIconButton';

const StyledUl = styled('ul')({
    marginBottom: 0,
});

interface IRemoveApiTokenButtonProps {
    token: IApiToken;
    project?: string;
}

export const RemoveApiTokenButton = ({
    token,
    project,
}: IRemoveApiTokenButtonProps) => {
    const { hasAccess } = useContext(AccessContext);
    const { deleteToken } = useApiTokensApi();
    const [open, setOpen] = useState(false);
    const { setToastData } = useToast();
    const { refetch } = useApiTokens();

    const permission = Boolean(project)
        ? DELETE_PROJECT_API_TOKEN
        : DELETE_API_TOKEN;

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
            <PermissionIconButton
                permission={permission}
                projectId={project}
                tooltipProps={{ title: 'Delete token', arrow: true }}
                onClick={() => setOpen(true)}
                size="large"
                disabled={hasAccess(permission)}
            >
                <Delete />
            </PermissionIconButton>
            <Dialogue
                open={open}
                onClick={onRemove}
                onClose={() => setOpen(false)}
                title="Confirm deletion"
            >
                <div>
                    Are you sure you want to delete the following API token?
                    <br />
                    <StyledUl>
                        <li>
                            <strong>username</strong>:{' '}
                            <code>{token.username}</code>
                        </li>
                        <li>
                            <strong>type</strong>: <code>{token.type}</code>
                        </li>
                    </StyledUl>
                </div>
            </Dialogue>
        </>
    );
};

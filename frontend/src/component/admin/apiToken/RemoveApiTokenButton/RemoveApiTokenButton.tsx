import {
    DELETE_API_TOKEN,
    DELETE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import { Delete } from '@mui/icons-material';
import { styled } from '@mui/material';
import {
    IApiToken,
    useApiTokens,
} from 'hooks/api/getters/useApiTokens/useApiTokens';
import AccessContext from 'contexts/AccessContext';
import { useContext, useMemo, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import useProjectApiTokensApi from '../../../../hooks/api/actions/useProjectApiTokensApi/useProjectApiTokensApi';

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
    const { hasAccess, isAdmin } = useContext(AccessContext);
    const { deleteToken } = useApiTokensApi();
    const { deleteToken: deleteProjectToken } = useProjectApiTokensApi();
    const [open, setOpen] = useState(false);
    const { setToastData } = useToast();
    const { refetch } = useApiTokens();

    const permission = Boolean(project)
        ? DELETE_PROJECT_API_TOKEN
        : DELETE_API_TOKEN;

    const canRemove = useMemo(() => {
        if (isAdmin) {
            return true;
        }
        if (token && token.projects && project && permission) {
            const { projects } = token;
            for (const tokenProject of projects) {
                if (!hasAccess(permission, tokenProject)) {
                    return false;
                }
            }
            return true;
        }
    }, [hasAccess, token, project, permission]);

    const onRemove = async () => {
        if (project) {
            await deleteProjectToken(token.secret, project);
        } else {
            await deleteToken(token.secret);
        }
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
                disabled={!canRemove}
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

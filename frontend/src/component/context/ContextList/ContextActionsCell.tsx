import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';
import {
    DELETE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    UPDATE_PROJECT_CONTEXT,
} from '@server/types/permissions.ts';

interface IContextActionsCellProps {
    name: string;
    onDelete: () => void;
    allowDelete: boolean;
}

export const ContextActionsCell: FC<IContextActionsCellProps> = ({
    name,
    onDelete,
    allowDelete,
}) => {
    const navigate = useNavigate();
    const projectId = useOptionalPathParam('projectId');
    const updateLocation = projectId
        ? `/projects/${projectId}/settings/context/edit/${name}`
        : `/context/edit/${name}`;

    return (
        <ActionCell>
            <PermissionIconButton
                permission={[UPDATE_CONTEXT_FIELD, UPDATE_PROJECT_CONTEXT]}
                projectId={projectId}
                onClick={() => navigate(updateLocation)}
                data-loading
                aria-label='edit'
                tooltipProps={{
                    title: 'Edit context field',
                }}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                permission={[DELETE_CONTEXT_FIELD, UPDATE_PROJECT_CONTEXT]}
                projectId={projectId}
                onClick={onDelete}
                data-loading
                disabled={!allowDelete}
                aria-label='delete'
                tooltipProps={{
                    title: 'Delete context field',
                }}
            >
                <Delete />
            </PermissionIconButton>
        </ActionCell>
    );
};

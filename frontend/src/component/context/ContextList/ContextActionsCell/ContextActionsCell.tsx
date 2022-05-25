import { VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, Edit } from '@mui/icons-material';
import {
    DELETE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
} from 'component/providers/AccessProvider/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';

interface IContextActionsCellProps {
    name: string;
    onDelete: () => void;
}

export const ContextActionsCell: VFC<IContextActionsCellProps> = ({
    name,
    onDelete,
}) => {
    const navigate = useNavigate();

    return (
        <ActionCell>
            <PermissionIconButton
                permission={UPDATE_CONTEXT_FIELD}
                onClick={() => navigate(`/context/edit/${name}`)}
                data-loading
                aria-label="edit"
                tooltipProps={{
                    title: 'Edit context field',
                }}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                permission={DELETE_CONTEXT_FIELD}
                onClick={onDelete}
                data-loading
                aria-label="delete"
                tooltipProps={{
                    title: 'Delete context field',
                }}
            >
                <Delete />
            </PermissionIconButton>
        </ActionCell>
    );
};

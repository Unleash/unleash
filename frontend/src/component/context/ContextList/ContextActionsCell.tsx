import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { useDynamicContextActionParams } from './useDynamicContextActionParams.ts';

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
    const { permissions, locations } = useDynamicContextActionParams();

    return (
        <ActionCell>
            <PermissionIconButton
                permission={permissions.update}
                onClick={() => navigate(locations.update(name))}
                data-loading
                aria-label='edit'
                tooltipProps={{
                    title: 'Edit context field',
                }}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                permission={permissions.delete}
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

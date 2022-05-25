import { Visibility, VisibilityOff, Edit, Delete } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import {
    UPDATE_ADDON,
    DELETE_ADDON,
} from 'component/providers/AccessProvider/permissions';
import { IAddon } from 'interfaces/addons';
import { useNavigate } from 'react-router-dom';

interface IConfiguredAddonsActionsCellProps {
    toggleAddon: (addon: IAddon) => Promise<void>;
    original: IAddon;
    setShowDelete: React.Dispatch<React.SetStateAction<boolean>>;
    setDeletedAddon: React.Dispatch<React.SetStateAction<IAddon>>;
}

export const ConfiguredAddonsActionsCell = ({
    toggleAddon,
    setShowDelete,
    setDeletedAddon,
    original,
}: IConfiguredAddonsActionsCellProps) => {
    const navigate = useNavigate();
    return (
        <ActionCell>
            <PermissionIconButton
                permission={UPDATE_ADDON}
                onClick={() => toggleAddon(original)}
                tooltipProps={{ title: 'Toggle addon' }}
            >
                <ConditionallyRender
                    condition={original.enabled}
                    show={<Visibility />}
                    elseShow={<VisibilityOff />}
                />
            </PermissionIconButton>
            <PermissionIconButton
                permission={UPDATE_ADDON}
                tooltipProps={{ title: 'Edit Addon' }}
                onClick={() => navigate(`/addons/edit/${original.id}`)}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                permission={DELETE_ADDON}
                tooltipProps={{ title: 'Remove Addon' }}
                onClick={() => {
                    setDeletedAddon(original);
                    setShowDelete(true);
                }}
            >
                <Delete />
            </PermissionIconButton>
        </ActionCell>
    );
};

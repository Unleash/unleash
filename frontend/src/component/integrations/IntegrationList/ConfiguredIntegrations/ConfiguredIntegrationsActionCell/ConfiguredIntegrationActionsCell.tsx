import { Edit, Delete } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { useOptimisticUpdate } from 'component/project/Project/ProjectFeatureToggles/FeatureToggleSwitch/hooks/useOptimisticUpdate';
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
    const [isEnabled, setIsEnabled, rollbackIsChecked] =
        useOptimisticUpdate<boolean>(original.enabled);

    const onClick = () => {
        setIsEnabled(!isEnabled);
        toggleAddon(original).catch(rollbackIsChecked);
    };

    return (
        <ActionCell>
            <Tooltip
                title={
                    isEnabled
                        ? `Disable addon ${original.provider}`
                        : `Enable addon ${original.provider}`
                }
                arrow
                describeChild
            >
                <PermissionSwitch
                    permission={UPDATE_ADDON}
                    checked={isEnabled}
                    onClick={onClick}
                />
            </Tooltip>
            <ActionCell.Divider />
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

import type { VFC } from 'react';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import Delete from '@mui/icons-material/Delete';
import Undo from '@mui/icons-material/Undo';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';

interface IReviveArchivedFeatureCell {
    onRevive: () => void;
    onDelete: () => void;
    project: string;
}

export const ArchivedFeatureActionCell: VFC<IReviveArchivedFeatureCell> = ({
    onRevive,
    onDelete,
    project,
}) => {
    return (
        <ActionCell>
            <PermissionIconButton
                onClick={onRevive}
                projectId={project}
                permission={UPDATE_FEATURE}
                tooltipProps={{ title: 'Revive feature flag' }}
                data-testid={`revive-feature-flag-button`}
            >
                <Undo />
            </PermissionIconButton>
            <PermissionIconButton
                permission={DELETE_FEATURE}
                projectId={project}
                tooltipProps={{ title: 'Delete feature flag' }}
                onClick={onDelete}
            >
                <Delete />
            </PermissionIconButton>
        </ActionCell>
    );
};

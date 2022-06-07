import { VFC } from 'react';
import { ActionCell } from '../../../common/Table/cells/ActionCell/ActionCell';
import { Undo } from '@mui/icons-material';
import PermissionIconButton from '../../../common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from '../../../providers/AccessProvider/permissions';

interface IReviveArchivedFeatureCell {
    onRevive: any;
    project: string;
}

export const ReviveArchivedFeatureCell: VFC<IReviveArchivedFeatureCell> = ({
    onRevive,
    project,
}) => {
    return (
        <ActionCell>
            <PermissionIconButton
                onClick={onRevive}
                projectId={project}
                permission={ADMIN}
            >
                <Undo />
            </PermissionIconButton>
        </ActionCell>
    );
};

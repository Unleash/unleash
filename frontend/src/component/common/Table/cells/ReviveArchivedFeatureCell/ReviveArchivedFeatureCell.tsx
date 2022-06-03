import { VFC } from 'react';
import { ActionCell } from '../ActionCell/ActionCell';
import { Undo } from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface IReviveArchivedFeatureCell {
    onRevive: any;
}

export const ReviveArchivedFeatureCell: VFC<IReviveArchivedFeatureCell> = ({
    onRevive,
}) => {
    return (
        <ActionCell>
            <IconButton onClick={onRevive}>
                <Undo />
            </IconButton>
        </ActionCell>
    );
};

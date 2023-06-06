import { VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, Edit } from '@mui/icons-material';
import {
    DELETE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
} from '../../providers/AccessProvider/permissions';
import PermissionIconButton from '../../common/PermissionIconButton/PermissionIconButton';
import { ActionCell } from '../../common/Table/cells/ActionCell/ActionCell';
import { TextCell } from '../../common/Table/cells/TextCell/TextCell';
import theme from '../../../themes/theme';
import { Box } from '@mui/material';
import { IUnleashContextDefinition } from '../../../interfaces/context';

interface IUsedInCellProps {
    original: IUnleashContextDefinition;
}

export const UsedInCell: VFC<IUsedInCellProps> = ({ original }) => {
    const projectText = original.usedInProjects === 1 ? 'project' : 'projects';
    const togglesText = original.usedInFeatures === 1 ? 'toggle' : 'toggles';
    return (
        <TextCell
            sx={{
                color:
                    original.usedInProjects === 0 &&
                    original.usedInFeatures === 0
                        ? theme.palette.text.disabled
                        : 'inherit',
            }}
        >
            <Box>
                {original.usedInProjects} {projectText}
            </Box>
            <Box>
                {original.usedInFeatures} feature {togglesText}
            </Box>
        </TextCell>
    );
};

import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    styled,
    type SelectChangeEvent,
} from '@mui/material';
import { useWorkspaceContext } from 'contexts/WorkspaceContext';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: 200,
    margin: theme.spacing(1),
}));

interface IWorkspaceSelectorProps {
    compact?: boolean;
}

export const WorkspaceSelector: FC<IWorkspaceSelectorProps> = ({
    compact = false,
}) => {
    const { workspaces, currentWorkspaceId, setWorkspace, loading } =
        useWorkspaceContext();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    if (loading || workspaces.length === 0) {
        return null;
    }

    const handleChange = (event: SelectChangeEvent<number>) => {
        const workspaceId = Number(event.target.value);
        setWorkspace(workspaceId);
    };

    return (
        <StyledFormControl
            variant='outlined'
            size={compact ? 'small' : 'medium'}
        >
            <InputLabel id='workspace-selector-label'>Workspace</InputLabel>
            <Select
                labelId='workspace-selector-label'
                id='workspace-selector'
                value={currentWorkspaceId || ''}
                onChange={handleChange}
                label='Workspace'
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                {workspaces.map((workspace) => (
                    <MenuItem key={workspace.id} value={workspace.id}>
                        {workspace.name}
                    </MenuItem>
                ))}
            </Select>
        </StyledFormControl>
    );
};

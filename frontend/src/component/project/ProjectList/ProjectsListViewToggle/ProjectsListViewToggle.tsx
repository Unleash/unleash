import { IconButton, Tooltip } from '@mui/material';
import type { ProjectsListView } from '../hooks/useProjectsListState.js';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';

type ProjectsListViewToggleProps = {
    view: ProjectsListView;
    setView: (view: ProjectsListView) => void;
};

export const ProjectsListViewToggle = ({
    view,
    setView,
}: ProjectsListViewToggleProps) => {
    const nextView = view === 'list' ? 'cards' : 'list';

    return (
        <Tooltip title={`Switch to ${nextView} view`} arrow>
            <IconButton size='small' onClick={() => setView(nextView)}>
                {nextView === 'list' ? (
                    <FormatListBulletedIcon />
                ) : (
                    <GridViewIcon />
                )}
            </IconButton>
        </Tooltip>
    );
};

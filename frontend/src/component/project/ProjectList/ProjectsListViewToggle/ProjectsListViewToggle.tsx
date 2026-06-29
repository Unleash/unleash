import { IconButton, Tooltip } from '@mui/material';
import type { ProjectsListView } from '../hooks/useProjectsListState.js';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import { useEventTracker } from 'hooks/useEventTracker.js';

type ProjectsListViewToggleProps = {
    view: ProjectsListView;
    setView: (view: ProjectsListView) => void;
};

export const ProjectsListViewToggle = ({
    view,
    setView,
}: ProjectsListViewToggleProps) => {
    const { trackEvent } = useEventTracker();
    const nextView = view === 'list' ? 'cards' : 'list';

    const onSetView = (newView: ProjectsListView) => {
        setView(newView);
        trackEvent('project-list-view-toggle', {
            props: {
                view: newView,
            },
        });
    };

    return (
        <Tooltip title={`Switch to ${nextView} view`} arrow>
            <IconButton size='medium' onClick={() => onSetView(nextView)}>
                {nextView === 'list' ? (
                    <FormatListBulletedIcon />
                ) : (
                    <GridViewIcon />
                )}
            </IconButton>
        </Tooltip>
    );
};

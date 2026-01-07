import { IconRenderer } from 'component/layout/MainLayout/NavigationSidebar/IconRenderer';
import InsightsIcon from '@mui/icons-material/Insights';
import PlaygroundIcon from '@mui/icons-material/AutoFixNormal';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';

export const ButtonItemIcon = ({ path }: { path: string }) => {
    if (path === '/projects') {
        return <ProjectIcon />;
    }
    if (path === '/playground') {
        return <PlaygroundIcon />;
    }
    if (path === '/insights') {
        return <InsightsIcon />;
    }

    return <IconRenderer path={path} />;
};

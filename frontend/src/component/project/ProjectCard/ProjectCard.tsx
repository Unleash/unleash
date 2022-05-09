import { Card, Menu, MenuItem } from '@mui/material';
import { useStyles } from './ProjectCard.styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIcon.svg';
import { useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Delete, Edit } from '@mui/icons-material';
import { getProjectEditPath } from 'utils/routePathHelpers';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import useToast from 'hooks/useToast';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IProjectCardProps {
    name: string;
    featureCount: number;
    health: number;
    memberCount: number;
    id: string;
    onHover: () => void;
}

export const ProjectCard = ({
    name,
    featureCount,
    health,
    memberCount,
    onHover,
    id,
}: IProjectCardProps) => {
    const { classes } = useStyles();
    const { refetch: refetchProjectOverview } = useProjects();
    const [anchorEl, setAnchorEl] = useState(null);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const { deleteProject } = useProjectApi();
    const navigate = useNavigate();
    const { setToastData, setToastApiError } = useToast();

    // @ts-expect-error
    const handleClick = e => {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
    };

    const onRemoveProject = async (e: Event) => {
        e.preventDefault();
        try {
            await deleteProject(id);
            refetchProjectOverview();
            setToastData({
                title: 'Deleted project',
                type: 'success',
                text: 'Successfully deleted project',
            });
        } catch (e: unknown) {
            setToastApiError(formatUnknownError(e));
        }
        setShowDelDialog(false);
        setAnchorEl(null);
    };

    return (
        <Card className={classes.projectCard} onMouseEnter={onHover}>
            <div className={classes.header} data-loading>
                <h2 className={classes.title}>{name}</h2>

                <PermissionIconButton
                    permission={UPDATE_PROJECT}
                    projectId={id}
                    className={classes.actionsBtn}
                    data-loading
                    onClick={handleClick}
                    tooltipProps={{ title: 'Options' }}
                >
                    <MoreVertIcon />
                </PermissionIconButton>

                <Menu
                    id="project-card-menu"
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    style={{ top: 0, left: -100 }}
                    onClose={(event: SyntheticEvent) => {
                        event.preventDefault();
                        setAnchorEl(null);
                    }}
                >
                    <MenuItem
                        onClick={e => {
                            e.preventDefault();
                            navigate(getProjectEditPath(id));
                        }}
                    >
                        <Edit className={classes.icon} />
                        Edit project
                    </MenuItem>
                    <MenuItem
                        onClick={e => {
                            e.preventDefault();
                            setShowDelDialog(true);
                        }}
                    >
                        <Delete className={classes.icon} />
                        Delete project
                    </MenuItem>
                </Menu>
            </div>
            <div data-loading>
                <ProjectIcon className={classes.projectIcon} />
            </div>
            <div className={classes.info}>
                <div className={classes.infoBox}>
                    <p className={classes.infoStats} data-loading>
                        {featureCount}
                    </p>
                    <p data-loading>toggles</p>
                </div>
                <div className={classes.infoBox}>
                    <p className={classes.infoStats} data-loading>
                        {health}%
                    </p>
                    <p data-loading>health</p>
                </div>

                <div className={classes.infoBox}>
                    <p className={classes.infoStats} data-loading>
                        {memberCount}
                    </p>
                    <p data-loading>members</p>
                </div>
            </div>
            <Dialogue
                open={showDelDialog}
                // @ts-expect-error
                onClick={onRemoveProject}
                onClose={() => {
                    setAnchorEl(null);
                    setShowDelDialog(false);
                }}
                title="Really delete project"
            />
        </Card>
    );
};

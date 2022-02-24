import { Card, Menu, MenuItem } from '@material-ui/core';
import { useStyles } from './ProjectCard.styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { ReactComponent as ProjectIcon } from '../../../assets/icons/projectIcon.svg';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Dialogue from 'component/common/Dialogue';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Delete, Edit } from '@material-ui/icons';
import { getProjectEditPath } from 'utils/route-path-helpers';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import useToast from 'hooks/useToast';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { formatUnknownError } from 'utils/format-unknown-error';

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
    const styles = useStyles();
    const { refetch: refetchProjectOverview } = useProjects();
    const [anchorEl, setAnchorEl] = useState(null);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const { deleteProject } = useProjectApi();
    const history = useHistory();
    const { setToastData, setToastApiError } = useToast();

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
        <Card className={styles.projectCard} onMouseEnter={onHover}>
            <div className={styles.header} data-loading>
                <div className={styles.title}>{name}</div>

                <PermissionIconButton
                    permission={UPDATE_PROJECT}
                    projectId={id}
                    className={styles.actionsBtn}
                    data-loading
                    onClick={handleClick}
                >
                    <MoreVertIcon />
                </PermissionIconButton>

                <Menu
                    id="project-card-menu"
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    style={{ top: '40px', left: '-60px' }}
                    onClose={e => {
                        e.preventDefault();
                        setAnchorEl(null);
                    }}
                >
                    <MenuItem
                        onClick={e => {
                            e.preventDefault();
                            history.push(getProjectEditPath(id));
                        }}
                    >
                        <Edit className={styles.icon} />
                        Edit project
                    </MenuItem>
                    <MenuItem
                        onClick={e => {
                            e.preventDefault();
                            setShowDelDialog(true);
                        }}
                    >
                        <Delete className={styles.icon} />
                        Delete project
                    </MenuItem>
                </Menu>
            </div>
            <div data-loading>
                <ProjectIcon className={styles.projectIcon} />
            </div>
            <div className={styles.info}>
                <div className={styles.infoBox}>
                    <p className={styles.infoStats} data-loading>
                        {featureCount}
                    </p>
                    <p data-loading>toggles</p>
                </div>
                <div className={styles.infoBox}>
                    <p className={styles.infoStats} data-loading>
                        {health}%
                    </p>
                    <p data-loading>health</p>
                </div>

                <div className={styles.infoBox}>
                    <p className={styles.infoStats} data-loading>
                        {memberCount}
                    </p>
                    <p data-loading>members</p>
                </div>
            </div>
            <Dialogue
                open={showDelDialog}
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

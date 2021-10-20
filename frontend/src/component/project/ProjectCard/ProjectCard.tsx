import { Card, Menu, MenuItem } from '@material-ui/core';
import { Dispatch, SetStateAction } from 'react';
import { useStyles } from './ProjectCard.styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { ReactComponent as ProjectIcon } from '../../../assets/icons/projectIcon.svg';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Dialogue from '../../common/Dialogue';
import useProjectApi from '../../../hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from '../../../hooks/api/getters/useProjects/useProjects';
import { Delete, Edit } from '@material-ui/icons';
import { getProjectEditPath } from '../../../utils/route-path-helpers';
import PermissionIconButton from '../../common/PermissionIconButton/PermissionIconButton';
import { UPDATE_PROJECT } from '../../../store/project/actions';
interface IProjectCardProps {
    name: string;
    featureCount: number;
    health: number;
    memberCount: number;
    id: string;
    onHover: () => void;
    setToastData: Dispatch<
        SetStateAction<{
            show: boolean;
            type: string;
            text: string;
        }>
    >;
}

const ProjectCard = ({
    name,
    featureCount,
    health,
    memberCount,
    onHover,
    id,
    setToastData,
}: IProjectCardProps) => {
    const styles = useStyles();
    const { refetch: refetchProjectOverview } = useProjects();
    const [anchorEl, setAnchorEl] = useState(null);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const { deleteProject } = useProjectApi();
    const history = useHistory();

    const handleClick = e => {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
    };

    return (
        <Card className={styles.projectCard} onMouseEnter={onHover}>
            <div className={styles.header} data-loading>
                <h2 className={styles.title}>{name}</h2>

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
                onClick={e => {
                    e.preventDefault();
                    deleteProject(id)
                        .then(() => {
                            setToastData({
                                show: true,
                                type: 'success',
                                text: 'Successfully deleted project',
                            });
                            refetchProjectOverview();
                        })
                        .catch(e => {
                            setToastData({
                                show: true,
                                type: 'error',
                                text: e.toString(),
                            });
                        })
                        .finally(() => {
                            setShowDelDialog(false);
                            setAnchorEl(null);
                        });
                }}
                onClose={e => {
                    e.preventDefault();
                    setAnchorEl(null);
                    setShowDelDialog(false);
                }}
                title="Really delete project"
            />
        </Card>
    );
};

export default ProjectCard;

import { Card, Menu, MenuItem } from '@mui/material';
import { useStyles } from './ProjectCard.styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIcon.svg';
import React, { useState, SyntheticEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, Edit } from '@mui/icons-material';
import { getProjectEditPath } from 'utils/routePathHelpers';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    UPDATE_PROJECT,
    DELETE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { DeleteProjectDialogue } from '../Project/DeleteProject/DeleteProjectDialogue';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';

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
    const { hasAccess } = useContext(AccessContext);
    const { isOss } = useUiConfig();
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const navigate = useNavigate();

    const handleClick = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget);
    };

    const canDeleteProject =
        hasAccess(DELETE_PROJECT, id) && id !== DEFAULT_PROJECT_ID;

    return (
        <Card className={classes.projectCard} onMouseEnter={onHover}>
            <div className={classes.header} data-loading>
                <h2 className={classes.title}>{name}</h2>

                <PermissionIconButton
                    permission={UPDATE_PROJECT}
                    hidden={isOss()}
                    projectId={id}
                    data-loading
                    onClick={handleClick}
                    tooltipProps={{
                        title: 'Options',
                        className: classes.actionsBtn,
                    }}
                >
                    <MoreVertIcon />
                </PermissionIconButton>

                <Menu
                    id="project-card-menu"
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    style={{ top: 0, left: -100 }}
                    onClick={event => {
                        event.preventDefault();
                    }}
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
                        disabled={!canDeleteProject}
                    >
                        <Delete className={classes.icon} />
                        {id === DEFAULT_PROJECT_ID && !canDeleteProject
                            ? "You can't delete the default project"
                            : 'Delete project'}
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

                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={
                        <div className={classes.infoBox}>
                            <p className={classes.infoStats} data-loading>
                                {memberCount}
                            </p>
                            <p data-loading>members</p>
                        </div>
                    }
                />
            </div>
            <DeleteProjectDialogue
                project={id}
                open={showDelDialog}
                onClose={() => {
                    setAnchorEl(null);
                    setShowDelDialog(false);
                }}
            />
        </Card>
    );
};

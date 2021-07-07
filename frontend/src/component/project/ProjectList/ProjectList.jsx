import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import HeaderTitle from '../../common/HeaderTitle';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import {
    CREATE_PROJECT,
    DELETE_PROJECT,
    UPDATE_PROJECT,
} from '../../AccessProvider/permissions';
import {
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import {
    Add,
    SupervisedUserCircle,
    Delete,
    FolderOpen,
} from '@material-ui/icons';

import { Link } from 'react-router-dom';
import ConfirmDialogue from '../../common/Dialogue';
import PageContent from '../../common/PageContent/PageContent';
import { useStyles } from './styles';
import AccessContext from '../../../contexts/AccessContext';
import ResponsiveButton from '../../common/ResponsiveButton/ResponsiveButton';

const ProjectList = ({ projects, fetchProjects, removeProject, history }) => {
    const { hasAccess } = useContext(AccessContext);
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    const [project, setProject] = useState(undefined);
    const styles = useStyles();
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const addProjectButton = () => (
        <ConditionallyRender
            condition={hasAccess(CREATE_PROJECT)}
            show={
                <ResponsiveButton
                    Icon={Add}
                    onClick={() => history.push('/projects/create')}
                    maxWidth="700px"
                    tooltip="Add new project"
                />
            }
        />
    );

    const projectLink = ({ id, name }) => (
        <Link to={`/projects/view/${id}`}>
            <strong>{name}</strong>
        </Link>
    );

    const mgmAccessButton = project => (
        <Tooltip title="Manage access">
            <Link
                to={`/projects/${project.id}/access`}
                style={{ color: 'black' }}
            >
                <IconButton aria-label="manage_access">
                    <SupervisedUserCircle />
                </IconButton>
            </Link>
        </Tooltip>
    );

    const deleteProjectButton = project => (
        <Tooltip title="Remove project">
            <IconButton
                aria-label="delete"
                onClick={() => {
                    setProject(project);
                    setShowDelDialogue(true);
                }}
            >
                <Delete />
            </IconButton>
        </Tooltip>
    );

    const renderProjectList = () =>
        projects.map(project => (
            <ListItem key={project.id} classes={{ root: styles.listItem }}>
                <ListItemAvatar>
                    <FolderOpen />
                </ListItemAvatar>
                <ListItemText
                    primary={projectLink(project)}
                    secondary={project.description}
                />
                <ConditionallyRender
                    condition={hasAccess(UPDATE_PROJECT, project.id)}
                    show={mgmAccessButton(project)}
                />
                <ConditionallyRender
                    condition={hasAccess(DELETE_PROJECT, project.id)}
                    show={deleteProjectButton(project)}
                />
            </ListItem>
        ));

    return (
        <PageContent
            headerContent={
                <HeaderTitle title="Projects" actions={addProjectButton()} />
            }
        >
            <List>
                <ConditionallyRender
                    condition={projects.length > 0}
                    show={renderProjectList()}
                    elseShow={<ListItem>No projects defined</ListItem>}
                />
            </List>
            <ConfirmDialogue
                open={showDelDialogue}
                onClick={() => {
                    removeProject(project);
                    setProject(undefined);
                    setShowDelDialogue(false);
                }}
                onClose={() => {
                    setProject(undefined);
                    setShowDelDialogue(false);
                }}
                title="Really delete project"
            />
        </PageContent>
    );
};

ProjectList.propTypes = {
    projects: PropTypes.array.isRequired,
    fetchProjects: PropTypes.func.isRequired,
    removeProject: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default ProjectList;

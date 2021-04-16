import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import HeaderTitle from '../../common/HeaderTitle';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import { CREATE_PROJECT, DELETE_PROJECT, UPDATE_PROJECT } from '../../../permissions';
import { Icon, IconButton, List, ListItem, ListItemAvatar, ListItemText, Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ConfirmDialogue from '../../common/Dialogue';
import PageContent from '../../common/PageContent/PageContent';
import { useStyles } from './styles';

const ProjectList = ({ projects, fetchProjects, removeProject, history, hasPermission }) => {
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    const [project, setProject] = useState(undefined);
    const styles = useStyles();
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const addProjectButton = () => (
        <ConditionallyRender
            condition={hasPermission(CREATE_PROJECT)}
            show={
                <Tooltip title="Add new project">
                    <IconButton aria-label="add-project" onClick={() => history.push('/projects/create')}>
                        <Icon>add</Icon>
                    </IconButton>
                </Tooltip>
            }
        />
    );

    const projectLink = ({ id, name }) => (
        <Link to={`/projects/edit/${id}`}>
            <strong>{name}</strong>
        </Link>
    );

    const mgmAccessButton = project => (
        <Tooltip title="Manage access">
            <Link to={`/projects/${project.id}/access`} style={{ color: 'black' }}>
                <IconButton aria-label="manage_access" >
                    <Icon>supervised_user_circle</Icon>
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
                <Icon>delete</Icon>
            </IconButton>
        </Tooltip>
    );

    const renderProjectList = () =>
        projects.map(project => (
            <ListItem key={project.name} classes={{ root: styles.listItem }}>
                <ListItemAvatar>
                    <Icon>folder_open</Icon>
                </ListItemAvatar>
                <ListItemText primary={projectLink(project)} secondary={project.description} />
                <ConditionallyRender
                    condition={hasPermission(UPDATE_PROJECT)}
                    show={mgmAccessButton(project)}
                />
                <ConditionallyRender condition={hasPermission(DELETE_PROJECT)} show={deleteProjectButton(project)} />
            </ListItem>
        ));

    return (
        <PageContent headerContent={<HeaderTitle title="Projects" actions={addProjectButton()} />}>
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
    hasPermission: PropTypes.func.isRequired,
};

export default ProjectList;

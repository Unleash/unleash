import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { List, ListItem, IconButton, Icon, Paper, ListItemAvatar, ListItemText, Tooltip } from '@material-ui/core';
import { HeaderTitle, styles as commonStyles } from '../common';
import { CREATE_PROJECT, DELETE_PROJECT } from '../../permissions';
import ConditionallyRender from '../common/conditionally-render';

class ProjectListComponent extends Component {
    static propTypes = {
        projects: PropTypes.array.isRequired,
        fetchProjects: PropTypes.func.isRequired,
        removeProject: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        hasPermission: PropTypes.func.isRequired,
        rbacEnabled: PropTypes.bool.isRequired,
    };

    componentDidMount() {
        this.props.fetchProjects();
    }

    removeProject = (project, evt) => {
        evt.preventDefault();
        this.props.removeProject(project);
    };

    projectLink = ({ id, name }) => (
        <Link to={`/projects/edit/${id}`}>
            <strong>{name}</strong>
        </Link>
    );

    deleteProjectButton = project => (
        <Tooltip title="Remove project">
            <IconButton aria-label="delete" onClick={this.removeProject.bind(this, project)}>
                <Icon>delete</Icon>
            </IconButton>
        </Tooltip>
    );

    projectList = () => {
        const { projects, hasPermission } = this.props;
        return projects.map((project, i) => (
            <ListItem key={i}>
                <ListItemAvatar>
                    <Icon>folder_open</Icon>
                </ListItemAvatar>
                <ListItemText primary={this.projectLink(project)} secondary={project.description} />
                <ConditionallyRender
                    condition={hasPermission(DELETE_PROJECT)}
                    show={this.deleteProjectButton(project)}
                />
            </ListItem>
        ));
    };

    addProjectButton = () => {
        const { hasPermission } = this.props;
        return (
            <ConditionallyRender
                condition={hasPermission(CREATE_PROJECT)}
                show={
                    <Tooltip title="Add new project">
                        <IconButton
                            aria-label="add-project"
                            onClick={() => this.props.history.push('/projects/create')}
                        >
                            <Icon>add</Icon>
                        </IconButton>
                    </Tooltip>
                }
            />
        );
    };

    render() {
        const { projects } = this.props;

        return (
            <Paper shadow={0} className={commonStyles.fullwidth}>
                <HeaderTitle title="Projects (beta)" actions={this.addProjectButton()} />
                <List>
                    <ConditionallyRender
                        condition={projects.length > 0}
                        show={this.projectList()}
                        elseShow={<ListItem>No projects defined</ListItem>}
                    />
                </List>
            </Paper>
        );
    }
}

export default ProjectListComponent;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { List, ListItem, ListItemAction, ListItemContent, IconButton, Card } from 'react-mdl';
import { HeaderTitle, styles as commonStyles } from '../common';
import { CREATE_PROJECT, DELETE_PROJECT, UPDATE_PROJECT } from '../../permissions';

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

    render() {
        const { projects, hasPermission, rbacEnabled } = this.props;

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <HeaderTitle
                    title="Projects (beta)"
                    actions={
                        hasPermission(CREATE_PROJECT) ? (
                            <IconButton
                                raised
                                colored
                                accent
                                name="add"
                                onClick={() => this.props.history.push('/projects/create')}
                                title="Add new project field"
                            />
                        ) : (
                            ''
                        )
                    }
                />
                <List>
                    {projects.length > 0 ? (
                        projects.map((project, i) => (
                            <ListItem key={i} twoLine>
                                <ListItemContent icon="folder_open" subtitle={project.description}>
                                    <Link to={`/projects/edit/${project.id}`}>
                                        <strong>{project.name}</strong>
                                    </Link>
                                </ListItemContent>
                                <ListItemAction>
                                    {hasPermission(UPDATE_PROJECT) && rbacEnabled ? (
                                        <Link to={`/projects/${project.id}/access`} style={{ color: 'black' }}>
                                            <IconButton name="supervised_user_circle" title="Manage access" />
                                        </Link>
                                    ) : (
                                        ''
                                    )}
                                    {hasPermission(DELETE_PROJECT) ? (
                                        <IconButton
                                            name="delete"
                                            title="Remove project"
                                            onClick={this.removeProject.bind(this, project)}
                                        />
                                    ) : (
                                        ''
                                    )}
                                </ListItemAction>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>No projects defined</ListItem>
                    )}
                </List>
            </Card>
        );
    }
}

export default ProjectListComponent;

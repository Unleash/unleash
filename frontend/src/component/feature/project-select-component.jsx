import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GeneralSelect from '../common/GeneralSelect/GeneralSelect';

class ProjectSelectComponent extends Component {
    componentDidMount() {
        const { fetchProjects, projects, enabled } = this.props;
        if (projects[0].initial && enabled) {
            fetchProjects();
        }
    }

    render() {
        const { value, projects, onChange, enabled, filter, defaultValue } =
            this.props;

        if (!enabled) {
            return null;
        }

        const formatOption = project => {
            return {
                key: project.id,
                label: project.name,
                title: project.description,
            };
        };

        let options;
        if (filter) {
            options = projects
                .filter(project => {
                    return filter(project.id);
                })
                .map(formatOption);
        } else {
            options = projects.map(formatOption);
        }

        if (value && !options.find(o => o.key === value)) {
            options.push({ key: value, label: value });
        }

        return (
            <GeneralSelect
                label="Project"
                defaultValue={defaultValue}
                options={options}
                value={value}
                onChange={onChange}
            />
        );
    }
}

ProjectSelectComponent.propTypes = {
    value: PropTypes.string,
    filled: PropTypes.bool,
    enabled: PropTypes.bool,
    projects: PropTypes.array.isRequired,
    fetchProjects: PropTypes.func,
    onChange: PropTypes.func.isRequired,
};

export default ProjectSelectComponent;

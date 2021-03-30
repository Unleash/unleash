import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MySelect from '../common/select';

class ProjectSelectComponent extends Component {
    componentDidMount() {
        const { fetchProjects, projects, enabled } = this.props;
        if (projects[0].initial && enabled) {
            fetchProjects();
        }
    }

    render() {
        const { value, projects, onChange, enabled } = this.props;

        if (!enabled) {
            return null;
        }

        const options = projects.map(t => ({
            key: t.id,
            label: t.name,
            title: t.description,
        }));

        if (value && !options.find(o => o.key === value)) {
            options.push({ key: value, label: value });
        }

        return <MySelect label="Project" options={options} value={value} onChange={onChange} />;
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MySelect from '../common/select';

class ProjectSelectComponent extends Component {
    componentDidMount() {
        const { fetchProjects, projects } = this.props;
        if (projects[0].inital && fetchProjects) {
            this.props.fetchProjects();
        }
    }

    render() {
        const { value, projects, onChange, filled } = this.props;

        if (!projects || projects.length === 1) {
            return null;
        }

        const options = projects.map(t => ({ key: t.id, label: t.name, title: t.description }));

        if (!options.find(o => o.key === value)) {
            options.push({ key: value, label: value });
        }

        return <MySelect label="Project" options={options} value={value} onChange={onChange} filled={filled} />;
    }
}

ProjectSelectComponent.propTypes = {
    value: PropTypes.string,
    filled: PropTypes.bool,
    projects: PropTypes.array.isRequired,
    fetchProjects: PropTypes.func,
    onChange: PropTypes.func.isRequired,
};

export default ProjectSelectComponent;

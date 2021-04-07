import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import Select from '../common/select';
import ReportCardContainer from './ReportCard/ReportCardContainer';
import ReportToggleListContainer from './ReportToggleList/ReportToggleListContainer';

import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';

import { formatProjectOptions } from './utils';
import { REPORTING_SELECT_ID } from '../../testIds';

import styles from './Reporting.module.scss';

const Reporting = ({ fetchFeatureToggles, projects }) => {
    const [projectOptions, setProjectOptions] = useState([{ key: 'default', label: 'Default' }]);
    const [selectedProject, setSelectedProject] = useState('default');

    useEffect(() => {
        fetchFeatureToggles();
        setSelectedProject(projects[0].id);
    }, [fetchFeatureToggles, projects]);

    useEffect(() => {
        setProjectOptions(formatProjectOptions(projects));
    }, [projects]);

    const onChange = e => {
        const { value } = e.target;

        const selectedProject = projectOptions.find(option => option.key === value);

        setSelectedProject(selectedProject.key);
    };

    const renderSelect = () => (
        <div className={styles.projectSelector}>
            <h1 className={styles.header}>Project</h1>
            <Select
                name="project"
                className={styles.select}
                options={projectOptions}
                value={selectedProject}
                onChange={onChange}
                inputProps={{ ['data-testid']: REPORTING_SELECT_ID }}
            />
        </div>
    );

    const multipleProjects = projects.length > 1;

    return (
        <React.Fragment>
            <ConditionallyRender condition={multipleProjects} show={renderSelect} />

            <ReportCardContainer selectedProject={selectedProject} />
            <ReportToggleListContainer selectedProject={selectedProject} />
        </React.Fragment>
    );
};

Reporting.propTypes = {
    fetchFeatureToggles: PropTypes.func.isRequired,
    projects: PropTypes.array.isRequired,
    features: PropTypes.array,
};

export default Reporting;

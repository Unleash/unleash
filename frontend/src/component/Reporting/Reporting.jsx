import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import Select from '../common/select';
import ReportCardContainer from './ReportCard/ReportCardContainer';
import ReportToggleListContainer from './ReportToggleList/ReportToggleListContainer';

import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';

import { formatProjectOptions } from './utils';
import { REPORTING_SELECT_ID } from '../../testIds';

import styles from './Reporting.module.scss';
import useHealthReport from '../../hooks/api/getters/useHealthReport/useHealthReport';
import ApiError from '../common/ApiError/ApiError';

const Reporting = ({ projects }) => {
    const [projectOptions, setProjectOptions] = useState([
        { key: 'default', label: 'Default' },
    ]);
    const [selectedProject, setSelectedProject] = useState('default');
    const { project, error, refetch } = useHealthReport(selectedProject);

    useEffect(() => {
        setSelectedProject(projects[0].id);
        /* eslint-disable-next-line */
    }, []);

    useEffect(() => {
        setProjectOptions(formatProjectOptions(projects));
    }, [projects]);

    const onChange = e => {
        const { value } = e.target;

        const selectedProject = projectOptions.find(
            option => option.key === value
        );

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
            <ConditionallyRender
                condition={multipleProjects}
                show={renderSelect}
            />

            <ConditionallyRender
                condition={error}
                show={
                    <ApiError
                        data-loading
                        style={{ maxWidth: '500px', marginTop: '1rem' }}
                        onClick={refetch}
                        text={`Could not fetch health rating for ${selectedProject}`}
                    />
                }
            />
            <ReportCardContainer
                health={project?.health}
                staleCount={project?.staleCount}
                activeCount={project?.activeCount}
                potentiallyStaleCount={project?.potentiallyStaleCount}
                selectedProject={selectedProject}
            />
            <ReportToggleListContainer
                features={project.features}
                selectedProject={selectedProject}
            />
        </React.Fragment>
    );
};

Reporting.propTypes = {
    fetchFeatureToggles: PropTypes.func.isRequired,
    projects: PropTypes.array.isRequired,
    features: PropTypes.array,
};

export default Reporting;

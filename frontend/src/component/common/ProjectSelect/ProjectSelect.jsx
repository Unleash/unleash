import React from 'react';
import { MenuItem } from '@material-ui/core';
import PropTypes from 'prop-types';
import DropdownMenu from '../DropdownMenu/DropdownMenu';

const ALL_PROJECTS = { id: '*', name: '> All projects' };

const ProjectSelect = ({
    projects,
    currentProjectId,
    updateCurrentProject,
}) => {
    const setProject = v => {
        const id = typeof v === 'string' ? v.trim() : '';
        updateCurrentProject(id);
    };

    if (!projects || projects.length === 1) {
        return null;
    }

    // TODO fixme
    let curentProject = projects.find(i => i.id === currentProjectId);
    if (!curentProject) {
        curentProject = ALL_PROJECTS;
    }

    const handleChangeProject = e => {
        const target = e.target.getAttribute('data-target');
        setProject(target);
    };

    const renderProjectItem = (selectedId, item) => (
        <MenuItem
            disabled={selectedId === item.id}
            data-target={item.id}
            key={item.id}
        >
            {item.name}
        </MenuItem>
    );

    const renderProjectOptions = () => {
        const start = [
            <MenuItem
                disabled={curentProject === ALL_PROJECTS}
                data-target={ALL_PROJECTS.id}
            >
                {ALL_PROJECTS.name}
            </MenuItem>,
        ];

        return [
            ...start,
            ...projects.map(p => renderProjectItem(currentProjectId, p)),
        ];
    };

    return (
        <React.Fragment>
            <DropdownMenu
                id={'project'}
                title="Select project"
                label={`${curentProject.name}`}
                callback={handleChangeProject}
                renderOptions={renderProjectOptions}
            />
        </React.Fragment>
    );
};

ProjectSelect.propTypes = {
    projects: PropTypes.array.isRequired,
    fetchProjects: PropTypes.func.isRequired,
    currentProjectId: PropTypes.string.isRequired,
    updateCurrentProject: PropTypes.func.isRequired,
};

export default ProjectSelect;

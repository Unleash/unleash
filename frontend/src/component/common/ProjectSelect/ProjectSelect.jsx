import React from 'react';
import { MenuItem } from '@material-ui/core';
import PropTypes from 'prop-types';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

const ALL_PROJECTS = { id: '*', name: '> All projects' };

const ProjectSelect = ({ currentProjectId, updateCurrentProject, ...rest }) => {
    const { projects } = useProjects();

    const setProject = v => {
        const id = v && typeof v === 'string' ? v.trim() : '*';
        updateCurrentProject(id);
    };

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
            style={{ fontSize: '14px' }}
        >
            {item.name}
        </MenuItem>
    );

    const renderProjectOptions = () => {
        const start = [
            <MenuItem
                disabled={curentProject === ALL_PROJECTS}
                data-target={ALL_PROJECTS.id}
                key={ALL_PROJECTS.id}
                style={{ fontSize: '14px' }}
            >
                {ALL_PROJECTS.name}
            </MenuItem>,
        ];

        return [
            ...start,
            ...projects.map(p => renderProjectItem(currentProjectId, p)),
        ];
    };

    const { updateSetting, ...passDown } = rest;

    return (
        <React.Fragment>
            <DropdownMenu
                id={'project'}
                title="Select project"
                label={`${curentProject.name}`}
                callback={handleChangeProject}
                renderOptions={renderProjectOptions}
                className=""
                {...passDown}
            />
        </React.Fragment>
    );
};

ProjectSelect.propTypes = {
    currentProjectId: PropTypes.string.isRequired,
    updateCurrentProject: PropTypes.func.isRequired,
};

export default ProjectSelect;

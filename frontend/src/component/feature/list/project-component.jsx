import React, { useEffect } from 'react';
import { Menu, MenuItem } from 'react-mdl';
import { DropdownButton } from '../../common';
import PropTypes from 'prop-types';

const ALL_PROJECTS = { id: '*', name: '> All projects' };

function projectItem(selectedId, item) {
    return (
        <MenuItem disabled={selectedId === item.id} data-target={item.id} key={item.id}>
            {item.name}
        </MenuItem>
    );
}

function ProjectComponent({ projects, currentProjectId, updateCurrentProject, enabled, fetchProjects }) {
    function setProject(v) {
        const id = typeof v === 'string' ? v.trim() : '';
        updateCurrentProject(id);
    }

    useEffect(() => {
        if (enabled) {
            fetchProjects();
        }
    }, [enabled]);

    if (!enabled) {
        return null;
    }

    // TODO fixme
    let currentProject = projects.find(i => i.id === currentProjectId);
    if (!currentProject) {
        currentProject = ALL_PROJECTS;
    }
    return (
        <React.Fragment>
            <DropdownButton
                className="mdl-color--amber-50"
                style={{ textTransform: 'none', fontWeight: 'normal' }}
                id="project"
                label={`${currentProject.name}`}
                title="Select project"
            />
            <Menu
                target="project"
                onClick={e => setProject(e.target.getAttribute('data-target'))}
                style={{ width: '168px' }}
            >
                <MenuItem disabled={currentProject === ALL_PROJECTS} data-target={ALL_PROJECTS.id}>
                    {ALL_PROJECTS.name}
                </MenuItem>
                {projects.map(p => projectItem(currentProjectId, p))}
            </Menu>
        </React.Fragment>
    );
}

ProjectComponent.propTypes = {
    projects: PropTypes.array.isRequired,
    fetchProjects: PropTypes.func.isRequired,
    currentProjectId: PropTypes.string.isRequired,
    updateCurrentProject: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
};

export default ProjectComponent;

import { connect } from 'react-redux';
import Component from './ProjectAccess/ProjectAccess';

const mapStateToProps = (state, props) => {
    const projectBase = { id: '', name: '', description: '' };
    const realProject = state.projects
        .toJS()
        .find(n => n.id === props.projectId);
    const project = Object.assign(projectBase, realProject);

    return {
        project,
    };
};

const mapDispatchToProps = () => ({});

const AccessContainer = connect(mapStateToProps, mapDispatchToProps)(Component);

export default AccessContainer;

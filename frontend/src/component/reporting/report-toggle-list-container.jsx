import { connect } from 'react-redux';

import { filterByProject } from './utils';

import ReportToggleList from './report-toggle-list';

const mapStateToProps = (state, ownProps) => {
    const features = state.features.toJS();

    const sameProject = filterByProject(ownProps.selectedProject);
    const featuresByProject = features.filter(sameProject);

    return {
        features: featuresByProject,
    };
};

const ReportToggleListContainer = connect(mapStateToProps, null)(ReportToggleList);

export default ReportToggleListContainer;

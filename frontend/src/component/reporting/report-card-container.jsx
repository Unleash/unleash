import { connect } from 'react-redux';

import ReportCard from './report-card';
import { filterByProject } from './utils';

const mapStateToProps = (state, ownProps) => {
    const features = state.features.toJS();

    const sameProject = filterByProject(ownProps.selectedProject);
    const featuresByProject = features.filter(sameProject);

    return {
        features: featuresByProject,
    };
};

const ReportCardContainer = connect(mapStateToProps, null)(ReportCard);

export default ReportCardContainer;

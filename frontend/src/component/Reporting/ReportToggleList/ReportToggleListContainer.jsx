import { connect } from 'react-redux';

import ReportToggleList from './ReportToggleList';

const mapStateToProps = (state, ownProps) => {};

const ReportToggleListContainer = connect(
    mapStateToProps,
    null
)(ReportToggleList);

export default ReportToggleListContainer;

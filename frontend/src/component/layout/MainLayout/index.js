import { connect } from 'react-redux';
import MainLayout from './MainLayout';

const mapStateToProps = (state, ownProps) => ({
    uiConfig: state.uiConfig.toJS(),
    location: ownProps.location,
    children: ownProps.children,
});

export default connect(mapStateToProps)(MainLayout);

import { connect } from 'react-redux';
import { loadInitialData } from '../../../store/loader';

import Header from './Header';

const mapStateToProps = state => ({ uiConfig: state.uiConfig.toJS() });

export default connect(mapStateToProps, {
    init: loadInitialData,
})(Header);

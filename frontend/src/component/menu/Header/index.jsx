import { connect } from 'react-redux';
import { loadInitialData } from '../../../store/loader';

const mapStateToProps = state => ({ uiConfig: state.uiConfig.toJS() });

import Header from './Header';

export default connect(mapStateToProps, {
    init: loadInitialData,
})(Header);

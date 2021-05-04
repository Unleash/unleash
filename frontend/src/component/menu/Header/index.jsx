import { connect } from 'react-redux';

import Header from './Header';

const mapStateToProps = state => ({ uiConfig: state.uiConfig.toJS() });

export default connect(mapStateToProps)(Header);

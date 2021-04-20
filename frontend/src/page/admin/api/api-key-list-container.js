import { connect } from 'react-redux';

import Component from './api-key-list';
import { fetchApiKeys, removeKey, addKey } from './../../../store/e-api-admin/actions';
export default connect(
    state => ({
        location: state.settings.toJS().location || {},
        unleashUrl: state.uiConfig.toJS().unleashUrl,
        keys: state.apiAdmin.toJS(),
    }),
    { fetchApiKeys, removeKey, addKey }
)(Component);

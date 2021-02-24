import { connect } from 'react-redux';

import Component from './api-key-list';
import { fetchApiKeys, removeKey, addKey } from './../../../store/e-api-admin/actions';
import { hasPermission } from '../../../permissions';

export default connect(
    state => ({
        location: state.settings.toJS().location || {},
        keys: state.apiAdmin.toJS(),
        hasPermission: permission => hasPermission(state.user.get('profile'), permission),
    }),
    { fetchApiKeys, removeKey, addKey }
)(Component);

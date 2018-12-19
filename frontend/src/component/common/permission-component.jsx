import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ADMIN } from '../../permissions';

class PermissionComponent extends Component {
    static propTypes = {
        user: PropTypes.object,
        component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
        others: PropTypes.object,
        denied: PropTypes.object,
        granted: PropTypes.object,
        otherwise: PropTypes.node,
        permission: PropTypes.string,
        children: PropTypes.node,
    };

    render() {
        const { user, otherwise, component: Component, permission, granted, denied, children, ...others } = this.props;
        let grantedComponent = Component;
        let deniedCompoinent = otherwise || '';

        if (granted || denied) {
            grantedComponent = (
                <Component {...others} {...granted || {}}>
                    {children}
                </Component>
            );
            deniedCompoinent = (
                <Component {...others} {...denied || {}}>
                    {children}
                </Component>
            );
        }

        if (!user) return deniedCompoinent;
        if (
            !user.permissions ||
            user.permissions.indexOf(ADMIN) !== -1 ||
            user.permissions.indexOf(permission) !== -1
        ) {
            return grantedComponent;
        }
        return deniedCompoinent;
    }
}

export default PermissionComponent;

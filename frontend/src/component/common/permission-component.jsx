import PropTypes from 'prop-types';
import { ADMIN } from '../../permissions';

const PermissionComponent = ({ user, permission, component, otherwise }) => {
    if (
        user &&
        (!user.permissions || user.permissions.indexOf(ADMIN) !== -1 || user.permissions.indexOf(permission) !== -1)
    ) {
        return component;
    }
    return otherwise || '';
};

PermissionComponent.propTypes = {
    user: PropTypes.object,
    component: PropTypes.node,
    otherwise: PropTypes.node,
    permission: PropTypes.string,
};

export default PermissionComponent;

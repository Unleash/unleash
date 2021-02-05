import { connect } from 'react-redux';
import AddonsListComponent from './list-component.jsx';
import { fetchAddons, removeAddon, updateAddon } from '../../store/addons/actions';
import { hasPermission } from '../../permissions';

const mapStateToProps = state => {
    const list = state.addons.toJS();

    return {
        addons: list.addons,
        providers: list.providers,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    };
};

const mapDispatchToProps = dispatch => ({
    removeAddon: addon => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to remove this addon?')) {
            removeAddon(addon)(dispatch);
        }
    },
    fetchAddons: () => fetchAddons()(dispatch),
    toggleAddon: addon => {
        const updatedAddon = { ...addon, enabled: !addon.enabled };
        return updateAddon(updatedAddon)(dispatch);
    },
});

const AddonsListContainer = connect(mapStateToProps, mapDispatchToProps)(AddonsListComponent);

export default AddonsListContainer;

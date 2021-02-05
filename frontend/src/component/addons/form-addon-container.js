import { connect } from 'react-redux';
import FormComponent from './form-addon-component';
import { updateAddon, createAddon, fetchAddons } from '../../store/addons/actions';
import { cloneDeep } from 'lodash';

// Required for to fill the inital form.
const DEFAULT_DATA = {
    provider: '',
    description: '',
    enabled: true,
    parameters: {},
    events: [],
};

const mapStateToProps = (state, params) => {
    const defaultAddon = cloneDeep(DEFAULT_DATA);
    const editMode = !!params.addonId;
    const addons = state.addons.get('addons').toJS();
    const providers = state.addons.get('providers').toJS();

    let addon;
    let provider;

    if (editMode) {
        addon = addons.find(addon => addon.id === +params.addonId) || defaultAddon;
        provider = addon ? providers.find(provider => provider.name === addon.provider) : undefined;
    } else {
        provider = providers.find(provider => provider.name === params.provider);
        addon = { ...defaultAddon, provider: provider ? provider.name : '' };
    }

    return {
        provider,
        addon,
        editMode,
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { addonId, history } = ownProps;
    const submit = addonId ? updateAddon : createAddon;

    return {
        submit: async addonConfig => {
            await submit(addonConfig)(dispatch);
            history.push('/addons');
        },
        fetch: () => fetchAddons()(dispatch),
        cancel: () => history.push('/addons'),
    };
};

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(FormComponent);

export default FormAddContainer;

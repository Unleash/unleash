import { Map as $Map } from 'immutable';
import { RECIEVE_GOOGLE_CONFIG, UPDATE_GOOGLE_AUTH, RECIEVE_SAML_CONFIG, UPDATE_SAML_AUTH } from './actions';

const store = (state = new $Map({ google: {}, saml: {} }), action) => {
    switch (action.type) {
        case UPDATE_GOOGLE_AUTH:
        case RECIEVE_GOOGLE_CONFIG:
            return state.set('google', action.config);
        case UPDATE_SAML_AUTH:
        case RECIEVE_SAML_CONFIG:
            return state.set('saml', action.config);
        default:
            return state;
    }
};

export default store;

import { fetchUIConfig } from './ui-config/actions';
import { fetchContext } from './context/actions';
import { fetchFeatureTypes } from './feature-type/actions';

export function loadInitalData() {
    return dispatch => {
        fetchUIConfig()(dispatch);
        fetchContext()(dispatch);
        fetchFeatureTypes()(dispatch);
    };
}

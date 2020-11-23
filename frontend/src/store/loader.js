import { fetchUIConfig } from './ui-config/actions';
import { fetchContext } from './context/actions';
import { fetchFeatureTypes } from './feature-type/actions';
import { fetchProjects } from './project/actions';

export function loadInitalData() {
    return dispatch => {
        fetchUIConfig()(dispatch);
        fetchContext()(dispatch);
        fetchFeatureTypes()(dispatch);
        fetchProjects()(dispatch);
    };
}

import { fetchUIConfig } from './ui-config/actions';
import { fetchContext } from './context/actions';
import { fetchFeatureTypes } from './feature-type/actions';
import { fetchProjects } from './project/actions';
import { fetchStrategies } from './strategy/actions';
import { fetchTagTypes } from './tag-type/actions';
import { C, P } from '../component/common/flags';

export function loadInitialData(flags = {}) {
    return dispatch => {
        fetchUIConfig()(dispatch);
        if (flags[C]) fetchContext()(dispatch);
        fetchFeatureTypes()(dispatch);
        if (flags[P]) fetchProjects()(dispatch);
        fetchStrategies()(dispatch);
        fetchTagTypes()(dispatch);
    };
}

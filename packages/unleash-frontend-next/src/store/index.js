import { combineReducers } from 'redux';
import features from './feature-store';
import strategies from './strategy-store';
import input from './input-store';
import history from './history-store'; // eslint-disable-line
import archive from './archive-store';
import error from './error-store';

const unleashStore = combineReducers({
    features,
    strategies,
    input,
    history,
    archive,
    error,
});

export default unleashStore;

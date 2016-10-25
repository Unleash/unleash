import { combineReducers } from 'redux';
import features from './feature-store';
import strategies from './strategy-store';
import input from './input-store';
import history from './history-store'; // eslint-disable-line

const unleashStore = combineReducers({
    features,
    strategies,
    input,
    history,
});

export default unleashStore;

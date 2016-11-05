import { Map as $Map } from 'immutable';

import {
    RECEIVE_FEATURE_METRICS,
} from './feature-metrics-actions';


const metrics = (state = new $Map(), action) => {
    switch (action.type) {
        case RECEIVE_FEATURE_METRICS:
            return new $Map(action.metrics);
        default:
            return state;
    }
};

export default metrics;

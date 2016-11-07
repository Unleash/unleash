import { Map as $Map, fromJS } from 'immutable';

import {
    RECEIVE_FEATURE_METRICS,
} from './feature-metrics-actions';


const metrics = (state = fromJS({ lastHour: {}, lastMinute: {} }), action) => {
    switch (action.type) {
        case RECEIVE_FEATURE_METRICS:
            return state.withMutations((ctx) => {
                ctx.set('lastHour', new $Map(action.metrics.lastHour));
                ctx.set('lastMinute', new $Map(action.metrics.lastMinute));
                return ctx;
            });
        default:
            return state;
    }
};

export default metrics;

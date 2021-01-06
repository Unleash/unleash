import { Map as $Map, fromJS } from 'immutable';

import { RECEIVE_FEATURE_METRICS, RECEIVE_SEEN_APPS } from './actions';

const metrics = (state = fromJS({ lastHour: {}, lastMinute: {}, seenApps: {} }), action) => {
    switch (action.type) {
        case RECEIVE_SEEN_APPS:
            return state.set('seenApps', new $Map(action.value));
        case RECEIVE_FEATURE_METRICS:
            return state.withMutations(ctx => {
                ctx.set('lastHour', new $Map(action.value.lastHour));
                ctx.set('lastMinute', new $Map(action.value.lastMinute));
                return ctx;
            });
        default:
            return state;
    }
};

export default metrics;

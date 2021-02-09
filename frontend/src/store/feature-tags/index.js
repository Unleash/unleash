import { List, Map as $MAP } from 'immutable';
import { RECEIVE_FEATURE_TOGGLE_TAGS, TAG_FEATURE_TOGGLE, UNTAG_FEATURE_TOGGLE } from './actions';

function getInitState() {
    return new List();
}

const featureTags = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_FEATURE_TOGGLE_TAGS:
            if (action.value) {
                return new List(action.value.tags);
            } else {
                return getInitState();
            }
        case TAG_FEATURE_TOGGLE:
            return state.push(new $MAP(action.tag));
        case UNTAG_FEATURE_TOGGLE:
            return state.remove(state.findIndex(t => t.value === action.tag.value && t.type === action.tag.type));
        default:
            return state;
    }
};

export default featureTags;

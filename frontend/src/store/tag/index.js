import { List, Map as $Map } from 'immutable';
import { ADD_TAG, DELETE_TAG, ERROR_FETCH_TAGS, RECEIVE_TAGS } from './actions';
const debug = require('debug')('unleash:tag-store');

const tags = (state = new List([]), action) => {
    switch (action.type) {
        case ADD_TAG:
            debug('Add tag');
            return state.push(new $Map(action.tag));
        case DELETE_TAG:
            debug('Delete tag');
            return state.filter(tag => tag.get('type') !== action.tag.type && tag.get('value') !== action.tag.value);
        case RECEIVE_TAGS:
            debug('Receive tags', action);
            return new List(action.value.tags.map($Map));
        case ERROR_FETCH_TAGS:
            debug('Error receiving tag types', action);
            return state;
        default:
            return state;
    }
};

export default tags;

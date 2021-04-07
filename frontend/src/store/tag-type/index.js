import { List, Map as $Map } from 'immutable';
import { RECEIVE_TAG_TYPES, ADD_TAG_TYPE, DELETE_TAG_TYPE, UPDATE_TAG_TYPE, ERROR_FETCH_TAG_TYPES } from './actions';

const debug = require('debug')('unleash:tag-type-store');

const tagTypes = (state = new List([]), action) => {
    switch (action.type) {
        case ADD_TAG_TYPE:
            debug('Add tagtype');
            return state.push(new $Map(action.tagType));
        case DELETE_TAG_TYPE:
            debug('Delete tagtype');
            return state.filter(tagtype => tagtype.get('name') !== action.tagType.name);
        case RECEIVE_TAG_TYPES:
            debug('Receive tag types', action);
            return new List(action.value.tagTypes.map($Map));
        case ERROR_FETCH_TAG_TYPES:
            debug('Error receiving tag types', action);
            return state;
        case UPDATE_TAG_TYPE:
            return state.map(tagtype => {
                if (tagtype.get('name') === action.tagType.name) {
                    return new $Map(action.tagType);
                } else {
                    return tagtype;
                }
            });
        default:
            return state;
    }
};

export default tagTypes;

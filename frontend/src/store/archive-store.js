import { List, Map as $Map } from 'immutable';
import { RECEIVE_ARCHIVE, REVIVE_TOGGLE } from './archive-actions';

function getInitState() {
    return new $Map({ list: new List() });
}

const archiveStore = (state = getInitState(), action) => {
    switch (action.type) {
        case REVIVE_TOGGLE:
            return state.update('list', list =>
                list.filter(item => item.name !== action.value)
            );
        case RECEIVE_ARCHIVE:
            return state.set('list', new List(action.value));
        default:
            return state;
    }
};

export default archiveStore;

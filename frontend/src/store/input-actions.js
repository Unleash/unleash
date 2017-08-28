export const actions = {
    SET_VALUE: 'SET_VALUE',
    INCREMENT_VALUE: 'INCREMENT_VALUE',
    LIST_PUSH: 'LIST_PUSH',
    LIST_POP: 'LIST_POP',
    LIST_UP: 'LIST_UP',
    CLEAR: 'CLEAR',
    INIT: 'INIT',
    MOVE: 'MOVE',
};

export const createInit = ({ id, value }) => ({ type: actions.INIT, id, value });
export const createInc = ({ id, key }) => ({ type: actions.INCREMENT_VALUE, id, key });
export const createSet = ({ id, key, value }) => ({ type: actions.SET_VALUE, id, key, value });
export const createPush = ({ id, key, value }) => ({ type: actions.LIST_PUSH, id, key, value });
export const createPop = ({ id, key, index }) => ({ type: actions.LIST_POP, id, key, index });
export const createMove = ({ id, key, index, toIndex }) => ({ type: actions.MOVE, id, key, index, toIndex });
export const createUp = ({ id, key, index, newValue, merge }) => ({
    type: actions.LIST_UP,
    id,
    key,
    index,
    newValue,
    merge,
});
export const createClear = ({ id }) => ({ type: actions.CLEAR, id });

export default actions;

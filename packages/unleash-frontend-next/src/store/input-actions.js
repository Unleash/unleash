export const actions = {
    SET_VALUE: 'SET_VALUE',
    INCREMENT_VALUE: 'INCREMENT_VALUE',
    CLEAR: 'CLEAR',
};

export const createInc = ({ id, key }) => ({ type: actions.INCREMENT_VALUE, id, key });
export const createSet = ({ id, key, value }) => ({ type: actions.SET_VALUE, id, key, value });
export const createClear = ({ id }) => ({ type: actions.CLEAR, id });

export default actions;

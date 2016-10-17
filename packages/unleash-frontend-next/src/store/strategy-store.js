import { List, Map as $Map } from 'immutable';

const init = new List([
    new $Map({ name: 'default', description: 'Default on/off strategy' }),
    new $Map(
        {
            name: 'ActiveForUserWithEmail',
            description: 'Active for user with specified email',
            parametersTemplate: { emails: 'string' },
        }),
]);


const strategies = (state = init, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export default strategies;

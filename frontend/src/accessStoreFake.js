import { Map as $MAp } from 'immutable';

export const createFakeStore = (permissions) => {
    return {
        getState: () => ({
            user: 
                new $MAp({
                    permissions
                })
        }),
    }
}
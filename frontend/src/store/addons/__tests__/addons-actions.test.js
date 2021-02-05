import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';

import {
    RECEIVE_ADDON_CONFIG,
    ERRPR_RECEIVE_ADDON_CONFIG,
    REMOVE_ADDON_CONFIG,
    UPDATE_ADDON_CONFIG,
    ADD_ADDON_CONFIG,
    fetchAddons,
    removeAddon,
    updateAddon,
    createAddon,
} from '../actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

afterEach(() => {
    fetchMock.restore();
});

test('creates RECEIVE_ADDON_CONFIG when fetching addons has been done', () => {
    fetchMock.getOnce('api/admin/addons', {
        body: { addons: { providers: [{ name: 'webhook' }] } },
        headers: { 'content-type': 'application/json' },
    });

    const expectedActions = [{ type: RECEIVE_ADDON_CONFIG, value: { addons: { providers: [{ name: 'webhook' }] } } }];
    const store = mockStore({ addons: [] });

    return store.dispatch(fetchAddons()).then(() => {
        // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
    });
});

test('creates RECEIVE_ADDON_CONFIG_ when fetching addons has been done', () => {
    fetchMock.getOnce('api/admin/addons', {
        body: { message: 'Server error' },
        headers: { 'content-type': 'application/json' },
        status: 500,
    });

    const store = mockStore({ addons: [] });

    return store.dispatch(fetchAddons()).catch(e => {
        // return of async actions
        expect(store.getActions()[0].error.type).toEqual(ERRPR_RECEIVE_ADDON_CONFIG);
        expect(e.message).toEqual('Unexpected exception when talking to unleash-api');
    });
});

test('creates REMOVE_ADDON_CONFIG when delete addon has been done', () => {
    const addon = {
        id: 1,
        provider: 'webhook',
    };

    fetchMock.deleteOnce('api/admin/addons/1', {
        status: 200,
    });

    const expectedActions = [{ type: REMOVE_ADDON_CONFIG, value: addon }];
    const store = mockStore({ addons: [] });

    return store.dispatch(removeAddon(addon)).then(() => {
        // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
    });
});

test('creates UPDATE_ADDON_CONFIG when delete addon has been done', () => {
    const addon = {
        id: 1,
        provider: 'webhook',
    };

    fetchMock.putOnce('api/admin/addons/1', {
        headers: { 'content-type': 'application/json' },
        status: 200,
        body: addon,
    });

    const expectedActions = [{ type: UPDATE_ADDON_CONFIG, value: addon }];
    const store = mockStore({ addons: [] });

    return store.dispatch(updateAddon(addon)).then(() => {
        // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
    });
});

test('creates ADD_ADDON_CONFIG when delete addon has been done', () => {
    const addon = {
        provider: 'webhook',
    };

    fetchMock.postOnce('api/admin/addons', {
        headers: { 'content-type': 'application/json' },
        status: 200,
        body: addon,
    });

    const expectedActions = [{ type: ADD_ADDON_CONFIG, value: addon }];
    const store = mockStore({ addons: [] });

    return store.dispatch(createAddon(addon)).then(() => {
        // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
    });
});

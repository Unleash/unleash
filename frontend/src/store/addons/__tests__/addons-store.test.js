import reducer from '../index';
import { RECEIVE_ADDON_CONFIG, ADD_ADDON_CONFIG, REMOVE_ADDON_CONFIG, UPDATE_ADDON_CONFIG } from '../actions';
import { addonSimple, addonsWithConfig, addonConfig } from './data';
import { USER_LOGOUT } from '../../user/actions';

test('should be default state', () => {
    const state = reducer(undefined, {});
    expect(state.toJS()).toMatchSnapshot();
});

test('should be merged state all', () => {
    const state = reducer(undefined, { type: RECEIVE_ADDON_CONFIG, value: addonSimple });
    expect(state.toJS()).toMatchSnapshot();
});

test('should add addon-config', () => {
    let state = reducer(undefined, { type: RECEIVE_ADDON_CONFIG, value: addonSimple });
    state = reducer(state, { type: ADD_ADDON_CONFIG, value: addonConfig });

    const data = state.toJS();
    expect(data).toMatchSnapshot();
    expect(data.addons.length).toBe(1);
});

test('should remove addon-config', () => {
    let state = reducer(undefined, { type: RECEIVE_ADDON_CONFIG, value: addonsWithConfig });
    state = reducer(state, { type: REMOVE_ADDON_CONFIG, value: addonConfig });

    const data = state.toJS();
    expect(data).toMatchSnapshot();
    expect(data.addons.length).toBe(0);
});

test('should update addon-config', () => {
    const updateAdddonConfig = { ...addonConfig, description: 'new desc', enabled: false };

    let state = reducer(undefined, { type: RECEIVE_ADDON_CONFIG, value: addonsWithConfig });
    state = reducer(state, { type: UPDATE_ADDON_CONFIG, value: updateAdddonConfig });

    const data = state.toJS();
    expect(data).toMatchSnapshot();
    expect(data.addons.length).toBe(1);
    expect(data.addons[0].description).toBe('new desc');
});

test('should clear addon-config on logout', () => {
    let state = reducer(undefined, { type: RECEIVE_ADDON_CONFIG, value: addonsWithConfig });
    state = reducer(state, { type: USER_LOGOUT });

    const data = state.toJS();
    expect(data).toMatchSnapshot();
    expect(data.addons.length).toBe(0);
    expect(data.providers.length).toBe(0);
});

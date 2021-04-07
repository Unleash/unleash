import api from './api';
import { dispatchError } from '../util';

export const RECEIVE_ADDON_CONFIG = 'RECEIVE_ADDON_CONFIG';
export const ERROR_RECEIVE_ADDON_CONFIG = 'ERROR_RECEIVE_ADDON_CONFIG';
export const REMOVE_ADDON_CONFIG = 'REMOVE_ADDON_CONFIG';
export const ERROR_REMOVING_ADDON_CONFIG = 'ERROR_REMOVING_ADDON_CONFIG';
export const ADD_ADDON_CONFIG = 'ADD_ADDON_CONFIG';
export const ERROR_ADD_ADDON_CONFIG = 'ERROR_ADD_ADDON_CONFIG';
export const UPDATE_ADDON_CONFIG = 'UPDATE_ADDON_CONFIG';
export const ERROR_UPDATE_ADDON_CONFIG = 'ERROR_UPDATE_ADDON_CONFIG';

// const receiveAddonConfig = value => ({ type: RECEIVE_ADDON_CONFIG, value });
const addAddonConfig = value => ({ type: ADD_ADDON_CONFIG, value });
const updateAdddonConfig = value => ({ type: UPDATE_ADDON_CONFIG, value });
const removeAddonconfig = value => ({ type: REMOVE_ADDON_CONFIG, value });

const success = (dispatch, type) => value => dispatch({ type, value });

export function fetchAddons() {
    return dispatch =>
        api
            .fetchAll()
            .then(success(dispatch, RECEIVE_ADDON_CONFIG))
            .catch(dispatchError(dispatch, ERROR_RECEIVE_ADDON_CONFIG));
}

export function removeAddon(addon) {
    return dispatch =>
        api
            .remove(addon)
            .then(() => dispatch(removeAddonconfig(addon)))
            .catch(dispatchError(dispatch, ERROR_REMOVING_ADDON_CONFIG));
}

export function createAddon(addon) {
    return dispatch =>
        api
            .create(addon)
            .then(res => res.json())
            .then(value => dispatch(addAddonConfig(value)))
            .catch(dispatchError(dispatch, ERROR_ADD_ADDON_CONFIG));
}

export function updateAddon(addon) {
    return dispatch =>
        api
            .update(addon)
            .then(() => dispatch(updateAdddonConfig(addon)))
            .catch(dispatchError(dispatch, ERROR_UPDATE_ADDON_CONFIG));
}

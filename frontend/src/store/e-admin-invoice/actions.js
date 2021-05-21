import api from './api';
import { dispatchError } from '../util';
export const RECEIVE_INVOICES = 'RECEIVE_INVOICES';
export const ERROR_FETCH_INVOICES = 'ERROR_FETCH_INVOICES';

const debug = require('debug')('unleash:e-admin-invoice-actions');

export function fetchInvoices() {
    debug('Start fetching invoices for hosted customer');
    return dispatch =>
        api
            .fetchAll()
            .then(value =>
                dispatch({
                    type: RECEIVE_INVOICES,
                    invoices: value.invoices,
                })
            )
            .catch(dispatchError(dispatch, ERROR_FETCH_INVOICES));
}
import apiReducer from '../index';
import { RECIEVE_API_DETAILS } from '../actions';

test('should have inital state', () => {
    const store = apiReducer(undefined, {});
    expect(store.toJS()).toEqual({});
});

test('should have new state', () => {
    const store = apiReducer(undefined, { type: RECIEVE_API_DETAILS, value: { version: '1.1.1' } });
    expect(store.toJS()).toEqual({ version: '1.1.1' });
});

test('should have updated state', () => {
    const inital = apiReducer(undefined, { type: RECIEVE_API_DETAILS, value: { version: '1.1.1' } });
    const store = apiReducer(inital, { type: RECIEVE_API_DETAILS, value: { version: '1.2.1' } });
    expect(store.toJS()).toEqual({ version: '1.2.1' });
});

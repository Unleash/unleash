import reducer from '../index';
import { receiveConfig } from '../actions';

beforeEach(() => {
    localStorage.clear();
});

test('should be default state', () => {
    const state = reducer(undefined, {});
    expect(state.toJS()).toMatchSnapshot();
});

test('should be merged state all', () => {
    const uiConfig = {
        headerBackground: 'red',
        slogan: 'hello',
        environment: 'dev',
    };

    const state = reducer(undefined, receiveConfig(uiConfig));
    expect(state.toJS()).toMatchSnapshot();
});

test('should only update headerBackground', () => {
    const uiConfig = {
        headerBackground: 'black',
    };

    const state = reducer(undefined, receiveConfig(uiConfig));
    expect(state.toJS()).toMatchSnapshot();
});

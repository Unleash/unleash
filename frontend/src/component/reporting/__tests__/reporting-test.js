import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { mount } from 'enzyme/build';

import Reporting from '../reporting';

import { testProjects, testFeatures } from '../testData';

const mockStore = {
    projects: testProjects,
    features: { toJS: () => testFeatures },
};
const mockReducer = state => state;

jest.mock('react-mdl', () => ({
    Checkbox: jest.fn().mockImplementation(({ children }) => children),
    Card: jest.fn().mockImplementation(({ children }) => children),
    Menu: jest.fn().mockImplementation(({ children }) => children),
    MenuItem: jest.fn().mockImplementation(({ children }) => children),
}));

test('changing projects renders only toggles from that project', () => {
    const wrapper = mount(
        <Provider store={createStore(mockReducer, mockStore)}>
            <Reporting projects={testProjects} features={testFeatures} fetchFeatureToggles={() => {}} />
        </Provider>
    );

    const select = wrapper.find('.mdl-textfield__input').first();
    expect(select.contains(<option value="default">Default</option>)).toBe(true);
    expect(select.contains(<option value="myProject">MyProject</option>)).toBe(true);

    let list = wrapper.find('tr');
    /* Length of projects belonging to project (3) + header row (1) */
    expect(list.length).toBe(4);

    select.simulate('change', { target: { value: 'myProject' } });
    list = wrapper.find('tr');

    expect(list.length).toBe(3);
});

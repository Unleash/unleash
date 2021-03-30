import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { createStore } from 'redux';
import { mount } from 'enzyme/build';

import Reporting from '../Reporting';
import { REPORTING_SELECT_ID } from '../../../testIds';

import { testProjects, testFeatures } from '../testData';

const mockStore = {
    projects: testProjects,
    features: { toJS: () => testFeatures },
};
const mockReducer = state => state;

test('changing projects renders only toggles from that project', () => {
    const wrapper = mount(
        <HashRouter>
            <Provider store={createStore(mockReducer, mockStore)}>
                <Reporting projects={testProjects} features={testFeatures} fetchFeatureToggles={() => {}} />
            </Provider>
        </HashRouter>
    );

    const select = wrapper.find(`input[data-test="${REPORTING_SELECT_ID}"][value="default"]`).first();

    let list = wrapper.find('tr');
    /* Length of projects belonging to project (3) + header row (1) */
    expect(list.length).toBe(4);

    select.simulate('change', { target: { value: 'myProject' } });
    list = wrapper.find('tr');

    expect(list.length).toBe(3);
});

import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { createStore } from 'redux';

import { render, screen, fireEvent } from '@testing-library/react';

import Reporting from '../Reporting';
import { REPORTING_SELECT_ID } from '../../../testIds';

import { testProjects, testFeatures } from '../testData';

const mockStore = {
    projects: testProjects,
    features: { toJS: () => testFeatures },
};
const mockReducer = state => state;

test('changing projects renders only toggles from that project', async () => {
    render(
        <HashRouter>
            <Provider store={createStore(mockReducer, mockStore)}>
                <Reporting projects={testProjects} features={testFeatures} fetchFeatureToggles={() => {}} />
            </Provider>
        </HashRouter>
    );

    const table = await screen.findByRole("table");
    /* Length of projects belonging to project (3) + header row (1) */
    expect(table.rows).toHaveLength(4);
    fireEvent.change(await screen.findByTestId(REPORTING_SELECT_ID), { target: { value: 'myProject'}});
    expect(table.rows).toHaveLength(3);
});

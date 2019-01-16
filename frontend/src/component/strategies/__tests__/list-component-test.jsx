import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import StrategiesListComponent from '../list-component';
import renderer from 'react-test-renderer';
import { CREATE_STRATEGY, DELETE_STRATEGY } from '../../../permissions';

jest.mock('react-mdl');

test('renders correctly with one strategy', () => {
    const strategy = {
        name: 'Another',
        description: "another's description",
    };
    const tree = renderer.create(
        <MemoryRouter>
            <StrategiesListComponent
                strategies={[strategy]}
                fetchStrategies={jest.fn()}
                removeStrategy={jest.fn()}
                history={{}}
                hasPermission={permission => [CREATE_STRATEGY, DELETE_STRATEGY].indexOf(permission) !== -1}
            />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with one strategy without permissions', () => {
    const strategy = {
        name: 'Another',
        description: "another's description",
    };
    const tree = renderer.create(
        <MemoryRouter>
            <StrategiesListComponent
                strategies={[strategy]}
                fetchStrategies={jest.fn()}
                removeStrategy={jest.fn()}
                history={{}}
                hasPermission={() => false}
            />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

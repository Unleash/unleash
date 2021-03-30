import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import { DrawerMenu } from '../drawer';

jest.mock('@material-ui/core');

test('should render DrawerMenu', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <DrawerMenu />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('should render DrawerMenu with "features" selected', () => {
    const tree = renderer.create(
        <MemoryRouter initialEntries={['/features']}>
            <DrawerMenu />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import { FooterMenu } from '../footer';

jest.mock('react-mdl');

test('should render DrawerMenu', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <FooterMenu />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('should render DrawerMenu with "features" selected', () => {
    const tree = renderer.create(
        <MemoryRouter initialEntries={['/features']}>
            <FooterMenu />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

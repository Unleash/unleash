import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import Footer from '../Footer/Footer';

jest.mock('@material-ui/core');

test('should render DrawerMenu', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('should render DrawerMenu with "features" selected', () => {
    const tree = renderer.create(
        <MemoryRouter initialEntries={['/features']}>
            <Footer />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

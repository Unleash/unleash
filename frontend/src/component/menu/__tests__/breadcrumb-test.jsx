import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import Breadcrumb from '../breadcrumb';

jest.mock('react-mdl');

test('breadcrumb for /features', () => {
    const tree = renderer.create(
        <MemoryRouter initialEntries={['/features']}>
            <Breadcrumb />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('breadcrumb for /features/view/Demo', () => {
    const tree = renderer.create(
        <MemoryRouter initialEntries={['/features/view/Demo']}>
            <Breadcrumb />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('breadcrumb for /strategies', () => {
    const tree = renderer.create(
        <MemoryRouter initialEntries={['/strategies']}>
            <Breadcrumb />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

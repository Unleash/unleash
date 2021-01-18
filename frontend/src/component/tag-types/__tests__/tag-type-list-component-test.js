import React from 'react';

import TagTypesList from '../list-component';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-mdl');

test('renders an empty list correctly', () => {
    const tree = renderer.create(
        <TagTypesList
            tagTypes={[]}
            fetchTagTypes={jest.fn()}
            removeTagType={jest.fn()}
            history={{}}
            hasPermission={() => true}
        />
    );
    expect(tree).toMatchSnapshot();
});

test('renders a list with elements correctly', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <TagTypesList
                tagTypes={[{ name: 'simple', description: 'Some simple description', icon: '#' }]}
                fetchTagTypes={jest.fn()}
                removeTagType={jest.fn()}
                history={{}}
                hasPermission={() => true}
            />
        </MemoryRouter>
    );
    expect(tree).toMatchSnapshot();
});

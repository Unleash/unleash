import React from 'react';

import TagTypes from '../form-tag-type-component';
import renderer from 'react-test-renderer';

jest.mock('react-mdl');

test('renders correctly for creating', () => {
    const tree = renderer
        .create(
            <TagTypes
                history={{}}
                title="Add tag type"
                createTagType={jest.fn()}
                validateName={() => Promise.resolve(true)}
                hasPermission={() => true}
                tagType={{ name: '', description: '', icon: '' }}
                editMode={false}
                submit={jest.fn()}
            />
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

test('it supports editMode', () => {
    const tree = renderer
        .create(
            <TagTypes
                history={{}}
                title="Add tag type"
                createTagType={jest.fn()}
                validateName={() => Promise.resolve(true)}
                hasPermission={() => true}
                tagType={{ name: '', description: '', icon: '' }}
                editMode
                submit={jest.fn()}
            />
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

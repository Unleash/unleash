import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import TagTypes from '../form-tag-type-component';
import renderer from 'react-test-renderer';
import theme from '../../../themes/main-theme';

jest.mock('@material-ui/core/TextField');

test('renders correctly for creating', () => {
    const tree = renderer
        .create(
            <ThemeProvider theme={theme}>
                <TagTypes
                    history={{}}
                    title="Add tag type"
                    createTagType={jest.fn()}
                    validateName={() => Promise.resolve(true)}
                    tagType={{ name: '', description: '', icon: '' }}
                    editMode={false}
                    submit={jest.fn()}
                />
            </ThemeProvider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

test('it supports editMode', () => {
    const tree = renderer
        .create(
            <ThemeProvider theme={theme}>
                <TagTypes
                    history={{}}
                    title="Add tag type"
                    createTagType={jest.fn()}
                    validateName={() => Promise.resolve(true)}
                    tagType={{ name: '', description: '', icon: '' }}
                    editMode
                    submit={jest.fn()}
                />
            </ThemeProvider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

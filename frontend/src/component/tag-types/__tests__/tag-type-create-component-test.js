import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import TagTypes from '../form-tag-type-component';
import renderer from 'react-test-renderer';
import theme from '../../../themes/main-theme';
import AccessProvider from '../../AccessProvider/AccessProvider';
import { createFakeStore } from '../../../accessStoreFake';
import { CREATE_TAG_TYPE, UPDATE_TAG_TYPE } from '../../AccessProvider/permissions';

jest.mock('@material-ui/core/TextField');

test('renders correctly for creating', () => {
    const tree = renderer
        .create(
            <ThemeProvider theme={theme}>
                <AccessProvider store={createFakeStore([{permission: CREATE_TAG_TYPE}])}>
                <TagTypes
                    history={{}}
                    title="Add tag type"
                    createTagType={jest.fn()}
                    validateName={() => Promise.resolve(true)}
                    tagType={{ name: '', description: '', icon: '' }}
                    editMode={false}
                    submit={jest.fn()}
                />
                </AccessProvider>
            </ThemeProvider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly for creating without permissions', () => {
    const tree = renderer
        .create(
            <ThemeProvider theme={theme}>
                <AccessProvider store={createFakeStore([])}>
                <TagTypes
                    history={{}}
                    title="Add tag type"
                    createTagType={jest.fn()}
                    validateName={() => Promise.resolve(true)}
                    tagType={{ name: '', description: '', icon: '' }}
                    editMode={false}
                    submit={jest.fn()}
                />
                </AccessProvider>
            </ThemeProvider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

test('it supports editMode', () => {
    const tree = renderer
        .create(
            <ThemeProvider theme={theme}>
                <AccessProvider store={createFakeStore([{permission: UPDATE_TAG_TYPE}])}>
                <TagTypes
                    history={{}}
                    title="Add tag type"
                    createTagType={jest.fn()}
                    validateName={() => Promise.resolve(true)}
                    tagType={{ name: '', description: '', icon: '' }}
                    editMode
                    submit={jest.fn()}
                />
                </AccessProvider>
            </ThemeProvider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

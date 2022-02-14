import React from 'react';
import { TagTypeList } from '../TagTypeList';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import theme from '../../../../themes/main-theme';
import AccessProvider from '../../../providers/AccessProvider/AccessProvider';
import {
    ADMIN,
    DELETE_TAG_TYPE,
    UPDATE_TAG_TYPE,
} from '../../../providers/AccessProvider/permissions';
import UIProvider from '../../../providers/UIProvider/UIProvider';

test('renders an empty list correctly', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <UIProvider>
                    <AccessProvider permissions={[{ permission: ADMIN }]}>
                        <TagTypeList
                            tagTypes={[]}
                            fetchTagTypes={jest.fn()}
                            removeTagType={jest.fn()}
                        />
                    </AccessProvider>
                </UIProvider>
            </ThemeProvider>
        </MemoryRouter>
    );
    expect(tree).toMatchSnapshot();
});

test('renders a list with elements correctly', () => {
    const tree = renderer.create(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
                <UIProvider>
                    <AccessProvider
                        permissions={[
                            { permission: UPDATE_TAG_TYPE },
                            { permission: DELETE_TAG_TYPE },
                        ]}
                    >
                        <TagTypeList
                            tagTypes={[
                                {
                                    name: 'simple',
                                    description: 'Some simple description',
                                    icon: '#',
                                },
                            ]}
                            fetchTagTypes={jest.fn()}
                            removeTagType={jest.fn()}
                        />
                    </AccessProvider>
                </UIProvider>
            </MemoryRouter>
        </ThemeProvider>
    );
    expect(tree).toMatchSnapshot();
});

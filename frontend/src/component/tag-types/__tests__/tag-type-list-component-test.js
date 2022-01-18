import React from 'react';

import TagTypesList from '../TagTypeList';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import theme from '../../../themes/main-theme';
import { createFakeStore } from '../../../accessStoreFake';
import AccessProvider from '../../providers/AccessProvider/AccessProvider';

import {
    ADMIN,
    CREATE_TAG_TYPE,
    UPDATE_TAG_TYPE,
    DELETE_TAG_TYPE,
} from '../../providers/AccessProvider/permissions';
import UIProvider from '../../providers/UIProvider/UIProvider';

test('renders an empty list correctly', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <UIProvider>
                    <AccessProvider
                        store={createFakeStore([{ permission: ADMIN }])}
                    >
                        <TagTypesList
                            tagTypes={[]}
                            fetchTagTypes={jest.fn()}
                            removeTagType={jest.fn()}
                            history={{}}
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
                        store={createFakeStore([
                            { permission: CREATE_TAG_TYPE },
                            { permission: UPDATE_TAG_TYPE },
                            { permission: DELETE_TAG_TYPE },
                        ])}
                    >
                        <TagTypesList
                            tagTypes={[
                                {
                                    name: 'simple',
                                    description: 'Some simple description',
                                    icon: '#',
                                },
                            ]}
                            fetchTagTypes={jest.fn()}
                            removeTagType={jest.fn()}
                            history={{}}
                        />
                    </AccessProvider>
                </UIProvider>
            </MemoryRouter>
        </ThemeProvider>
    );
    expect(tree).toMatchSnapshot();
});

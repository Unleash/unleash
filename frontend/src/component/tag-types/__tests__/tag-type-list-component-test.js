import React from 'react';

import TagTypesList from '../TagTypeList';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import theme from '../../../themes/main-theme';

test('renders an empty list correctly', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <TagTypesList
                    tagTypes={[]}
                    fetchTagTypes={jest.fn()}
                    removeTagType={jest.fn()}
                    history={{}}
                    hasPermission={() => true}
                />
            </ThemeProvider>
        </MemoryRouter>
    );
    expect(tree).toMatchSnapshot();
});

test('renders a list with elements correctly', () => {
    const tree = renderer.create(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
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
                    hasPermission={() => true}
                />
            </MemoryRouter>
        </ThemeProvider>
    );
    expect(tree).toMatchSnapshot();
});

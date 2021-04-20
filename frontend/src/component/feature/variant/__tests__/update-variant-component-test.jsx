import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';

import UpdateVariant from './../update-variant-component';
import renderer from 'react-test-renderer';
import { weightTypes } from '../enums';
import theme from '../../../../themes/main-theme';

jest.mock(
    '../AddVariant/OverrideConfig/OverrideConfig.jsx',
    () => 'OverrideConfig'
);

test('renders correctly with without variants', () => {
    const tree = renderer.create(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
                <UpdateVariant
                    key={0}
                    variants={[]}
                    addVariant={jest.fn()}
                    removeVariant={jest.fn()}
                    updateVariant={jest.fn()}
                    stickinessOptions={['default']}
                    updateStickiness={jest.fn()}
                    editable
                />
            </MemoryRouter>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with without variants and no permissions', () => {
    const tree = renderer.create(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
                <UpdateVariant
                    key={0}
                    variants={[]}
                    addVariant={jest.fn()}
                    removeVariant={jest.fn()}
                    updateVariant={jest.fn()}
                    stickinessOptions={['default']}
                    updateStickiness={jest.fn()}
                    editable
                />
            </MemoryRouter>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with with variants', () => {
    const featureToggle = {
        name: 'toggle.variants',
        description: 'description',
        enabled: false,
        strategies: [
            {
                name: 'gradualRolloutRandom',
                parameters: {
                    percentage: 50,
                },
            },
        ],
        variants: [
            {
                name: 'blue',
                weight: 34,
                overrides: [
                    {
                        field: 'userId',
                        values: ['1337', '123'],
                    },
                ],
            },
            {
                name: 'yellow',
                weight: 33,
            },
            {
                name: 'orange',
                weight: 33,
                weightType: weightTypes.FIX,
                payload: {
                    type: 'string',
                    value: '{"color": "blue", "animated": false}',
                },
            },
        ],
        createdAt: '2018-02-04T20:27:52.127Z',
    };
    const tree = renderer.create(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
                <UpdateVariant
                    key={0}
                    variants={featureToggle.variants}
                    addVariant={jest.fn()}
                    removeVariant={jest.fn()}
                    updateVariant={jest.fn()}
                    stickinessOptions={['default']}
                    updateStickiness={jest.fn()}
                    editable
                />
            </MemoryRouter>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});

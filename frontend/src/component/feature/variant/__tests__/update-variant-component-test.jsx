import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import UpdateVariant from './../update-variant-component';
import renderer from 'react-test-renderer';
import { UPDATE_FEATURE } from '../../../../permissions';

jest.mock('react-mdl');

test('renders correctly with without variants', () => {
    const featureToggle = {
        name: 'Another',
        description: "another's description",
        enabled: false,
        strategies: [
            {
                name: 'gradualRolloutRandom',
                parameters: {
                    percentage: 50,
                },
            },
        ],
        createdAt: '2018-02-04T20:27:52.127Z',
    };
    const tree = renderer.create(
        <MemoryRouter>
            <UpdateVariant
                key={0}
                input={featureToggle}
                onCancel={jest.fn()}
                features={[]}
                setValue={jest.fn()}
                addVariant={jest.fn()}
                removeVariant={jest.fn()}
                updateVariant={jest.fn()}
                onSubmit={jest.fn()}
                onCancel={jest.fn()}
                init={jest.fn()}
                hasPermission={permission => permission === UPDATE_FEATURE}
            />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with without variants and no permissions', () => {
    const featureToggle = {
        name: 'Another',
        description: "another's description",
        enabled: false,
        strategies: [
            {
                name: 'gradualRolloutRandom',
                parameters: {
                    percentage: 50,
                },
            },
        ],
        createdAt: '2018-02-04T20:27:52.127Z',
    };
    const tree = renderer.create(
        <MemoryRouter>
            <UpdateVariant
                key={0}
                input={featureToggle}
                onCancel={jest.fn()}
                features={[]}
                setValue={jest.fn()}
                addVariant={jest.fn()}
                removeVariant={jest.fn()}
                updateVariant={jest.fn()}
                onSubmit={jest.fn()}
                onCancel={jest.fn()}
                init={jest.fn()}
                hasPermission={() => false}
            />
        </MemoryRouter>
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
                payload: {
                    type: 'string',
                    value: '{"color": "blue", "animated": false}',
                },
            },
        ],
        createdAt: '2018-02-04T20:27:52.127Z',
    };
    const tree = renderer.create(
        <MemoryRouter>
            <UpdateVariant
                key={0}
                input={featureToggle}
                onCancel={jest.fn()}
                features={[]}
                setValue={jest.fn()}
                addVariant={jest.fn()}
                removeVariant={jest.fn()}
                updateVariant={jest.fn()}
                onSubmit={jest.fn()}
                onCancel={jest.fn()}
                init={jest.fn()}
                hasPermission={permission => permission === UPDATE_FEATURE}
            />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

import { createFeatureStrategy } from 'utils/createFeatureStrategy';

test('createFeatureStrategy', () => {
    expect(
        createFeatureStrategy('a', {
            name: 'b',
            displayName: 'c',
            editable: true,
            deprecated: false,
            description: 'd',
            parameters: [],
        }),
    ).toMatchInlineSnapshot(`
      {
        "constraints": [],
        "name": "b",
        "parameters": {},
      }
    `);
});

test('createFeatureStrategy with parameters', () => {
    expect(
        createFeatureStrategy('a', {
            name: 'b',
            displayName: 'c',
            editable: true,
            deprecated: false,
            description: 'd',
            parameters: [
                {
                    name: 'groupId',
                    type: 'string',
                    description: 'a',
                    required: true,
                },
                {
                    name: 'stickiness',
                    type: 'string',
                    description: 'a',
                    required: true,
                },
                {
                    name: 'rollout',
                    type: 'percentage',
                    description: 'a',
                    required: true,
                },
                {
                    name: 's',
                    type: 'string',
                    description: 's',
                    required: true,
                },
                {
                    name: 'b',
                    type: 'boolean',
                    description: 'b',
                    required: true,
                },
            ],
        }),
    ).toMatchInlineSnapshot(`
      {
        "constraints": [],
        "name": "b",
        "parameters": {
          "b": "false",
          "groupId": "a",
          "rollout": "50",
          "s": "",
          "stickiness": "default",
        },
      }
    `);
});

test('createFeatureStrategy with custom default stickiness', () => {
    expect(
        createFeatureStrategy(
            'a',
            {
                name: 'flexibleRollout',
                displayName: 'Gradual rollout',
                editable: true,
                deprecated: false,
                description: '',
                parameters: [
                    {
                        name: 'stickiness',
                        type: 'string',
                        description: '',
                        required: true,
                    },
                ],
            },
            'userId',
        ),
    ).toMatchInlineSnapshot(`
      {
        "constraints": [],
        "name": "flexibleRollout",
        "parameters": {
          "stickiness": "userId",
        },
      }
    `);
});

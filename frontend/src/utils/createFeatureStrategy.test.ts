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
        })
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
        })
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

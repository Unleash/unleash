import { validateSchema } from '../validate';
import { ClientFeaturesSchema } from './client-features-schema';

test('clientFeaturesSchema no fields', () => {
    expect(
        validateSchema('#/components/schemas/clientFeaturesSchema', {}),
    ).toMatchSnapshot();
});

test('clientFeaturesSchema required fields', () => {
    const data: ClientFeaturesSchema = {
        version: 0,
        query: {},
        features: [
            {
                name: 'some-name',
                enabled: false,
                impressionData: false,
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/clientFeaturesSchema', data),
    ).toBeUndefined();
});

test('clientFeaturesSchema java-sdk expected response', () => {
    const json = `{
    "version": 2,
    "segments": [
        {
            "id": 1,
            "name": "some-name",
            "description": null,
            "constraints": [
                {
                    "contextName": "some-name",
                    "operator": "IN",
                    "value": "name",
                    "inverted": false,
                    "caseInsensitive": true
                }
            ]
        }
    ],
    "features": [
            {
                "name": "Test.old",
                "description": "No variants here!",
                "enabled": true,
                "strategies": [
                    {
                        "name": "default"
                    }
                ],
                "variants": null,
                "createdAt": "2019-01-24T10:38:10.370Z"
            },
            {
                "name": "Test.variants",
                "description": null,
                "enabled": true,
                "strategies": [
                    {
                        "name": "default",
                        "segments": [
                            1
                        ]
                    }
                ],
                "variants": [
                    {
                        "name": "variant1",
                        "weight": 50
                    },
                    {
                        "name": "variant2",
                        "weight": 50
                    }
                ],
                "createdAt": "2019-01-24T10:41:45.236Z"
            },
            {
                "name": "featureX",
                "enabled": true,
                "strategies": [
                    {
                        "name": "default"
                    }
                ]
            },
            {
                "name": "featureY",
                "enabled": false,
                "strategies": [
                    {
                        "name": "baz",
                        "parameters": {
                            "foo": "bar"
                        }
                    }
                ]

            },
            {
                "name": "featureZ",
                "enabled": true,
                "strategies": [
                    {
                        "name": "default"
                    },
                    {
                        "name": "hola",
                        "parameters": {
                            "name": "val"
                        },
                        "segments": [1]
                    }
                ]

            }
        ]
}
`;

    expect(
        validateSchema(
            '#/components/schemas/clientFeaturesSchema',
            JSON.parse(json),
        ),
    ).toBeUndefined();
});

test('clientFeaturesSchema unleash-proxy expected response', () => {
    const json = `{
    "version": 2,
    "segments": [
        {
            "id": 1,
            "name": "some-name",
            "description": null,
            "constraints": [
                {
                    "contextName": "some-name",
                    "operator": "IN",
                    "value": "name",
                    "inverted": false,
                    "caseInsensitive": true
                }
            ]
        }
    ],
    "features": [
            {
                "name": "Test.old",
                "description": "No variants here!",
                "enabled": true,
                "strategies": [
                    {
                        "name": "default"
                    }
                ],
                "variants": null,
                "createdAt": "2019-01-24T10:38:10.370Z"
            },
            {
                "name": "Test.variants",
                "description": null,
                "enabled": true,
                "strategies": [
                    {
                        "name": "default",
                        "segments": [
                            1
                        ]
                    }
                ],
                "variants": [
                    {
                        "name": "variant1",
                        "weight": 50
                    },
                    {
                        "name": "variant2",
                        "weight": 50
                    }
                ],
                "createdAt": "2019-01-24T10:41:45.236Z"
            },
            {
                "name": "featureX",
                "enabled": true,
                "strategies": [
                    {
                        "name": "default"
                    }
                ]
            },
            {
                "name": "featureY",
                "enabled": false,
                "strategies": [
                    {
                        "name": "baz",
                        "parameters": {
                            "foo": "bar"
                        }
                    }
                ]

            },
            {
                "name": "featureZ",
                "enabled": true,
                "strategies": [
                    {
                        "name": "default"
                    },
                    {
                        "name": "hola",
                        "parameters": {
                            "name": "val"
                        },
                        "segments": [1]
                    }
                ]

            }
        ]
}
`;

    expect(
        validateSchema(
            '#/components/schemas/clientFeaturesSchema',
            JSON.parse(json),
        ),
    ).toBeUndefined();
});

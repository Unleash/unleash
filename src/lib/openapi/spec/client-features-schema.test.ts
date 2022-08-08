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
                variants: [
                    {
                        name: 'a',
                        weight: 1,
                        weightType: 'b',
                        stickiness: 'c',
                        payload: {
                            type: 'a',
                            value: 'b',
                        },
                        overrides: [
                            {
                                contextName: 'a',
                                values: ['b'],
                            },
                        ],
                    },
                ],
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
              "segments": [
                1
              ]
            }
          ]
        }
      ]
    }`;

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
              "segments": [
                1
              ]
            }
          ]
        }
      ]
    }`;

    expect(
        validateSchema(
            '#/components/schemas/clientFeaturesSchema',
            JSON.parse(json),
        ),
    ).toBeUndefined();
});

test('clientFeaturesSchema client specification test 15', () => {
    const json = `{
      "version": 2,
      "features": [
        {
          "name": "F9.globalSegmentOn",
          "description": "With global segment referencing constraint in on state",
          "enabled": true,
          "strategies": [
            {
              "name": "default",
              "parameters": {},
              "segments": [
                1
              ]
            }
          ]
        },
        {
          "name": "F9.globalSegmentOff",
          "description": "With global segment referencing constraint in off state",
          "enabled": true,
          "strategies": [
            {
              "name": "default",
              "parameters": {},
              "segments": [
                2
              ]
            }
          ]
        },
        {
          "name": "F9.globalSegmentAndConstraint",
          "description": "With global segment and constraint both on",
          "enabled": true,
          "strategies": [
            {
              "name": "default",
              "parameters": {},
              "constraints": [
                {
                  "contextName": "version",
                  "operator": "SEMVER_EQ",
                  "value": "1.2.2"
                }
              ],
              "segments": [
                1
              ]
            }
          ]
        },
        {
          "name": "F9.withExtraParams",
          "description": "With global segment that doesn't exist",
          "enabled": true,
          "project": "some-project",
          "strategies": [
            {
              "name": "default",
              "parameters": {},
              "constraints": [
                {
                  "contextName": "version",
                  "operator": "SEMVER_EQ",
                  "value": "1.2.2"
                }
              ],
              "segments": [
                3
              ]
            }
          ]
        },
        {
          "name": "F9.withSeveralConstraintsAndSegments",
          "description": "With several segments and constraints",
          "enabled": true,
          "strategies": [
            {
              "name": "default",
              "parameters": {},
              "constraints": [
                {
                  "contextName": "customNumber",
                  "operator": "NUM_LT",
                  "value": "10"
                },
                {
                  "contextName": "version",
                  "operator": "SEMVER_LT",
                  "value": "3.2.2"
                }
              ],
              "segments": [
                1,
                4,
                5
              ]
            }
          ]
        }
      ],
      "segments": [
        {
          "id": 1,
          "constraints": [
            {
              "contextName": "version",
              "operator": "SEMVER_EQ",
              "value": "1.2.2"
            }
          ]
        },
        {
          "id": 2,
          "constraints": [
            {
              "contextName": "version",
              "operator": "SEMVER_EQ",
              "value": "3.1.4"
            }
          ]
        },
        {
          "id": 3,
          "constraints": [
            {
              "contextName": "version",
              "operator": "SEMVER_EQ",
              "value": "3.1.4"
            }
          ]
        },
        {
          "id": 4,
          "constraints": [
            {
              "contextName": "customName",
              "operator": "STR_CONTAINS",
              "values": [
                "Pi"
              ]
            }
          ]
        },
        {
          "id": 5,
          "constraints": [
            {
              "contextName": "slicesLeft",
              "operator": "NUM_LTE",
              "value": "4"
            }
          ]
        }
      ]
    }`;

    expect(
        validateSchema(
            '#/components/schemas/clientFeaturesSchema',
            JSON.parse(json),
        ),
    ).toBeUndefined();
});

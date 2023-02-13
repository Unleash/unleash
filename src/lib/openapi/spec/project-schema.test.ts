import { validateSchema } from '../validate';
import { ProjectSchema } from './project-schema';

test('projectSchema', () => {
    const data: ProjectSchema = {
        name: 'Default',
        id: 'default',
        description: 'Default project',
        health: 74,
        featureCount: 10,
        memberCount: 3,
        updatedAt: '2022-06-28T17:33:53.963Z',
    };

    expect(
        validateSchema('#/components/schemas/projectSchema', {}),
    ).not.toBeUndefined();

    expect(
        validateSchema('#/components/schemas/projectSchema', data),
    ).toBeUndefined();
});

test('projectSchema with only required', () => {
    const data: ProjectSchema = {
        name: 'Default',
        id: 'default',
    };

    expect(
        validateSchema('#/components/schemas/projectSchema', {}),
    ).not.toBeUndefined();

    expect(
        validateSchema('#/components/schemas/projectSchema', data),
    ).toBeUndefined();
});

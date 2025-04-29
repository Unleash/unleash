import { validateSchema } from '../validate.js';
import type { ExportQuerySchema } from './export-query-schema.js';

test('exportQuerySchema', () => {
    const data: ExportQuerySchema = {
        environment: 'production',
        features: ['firstFeature', 'secondFeature'],
    };

    expect(
        validateSchema('#/components/schemas/exportQuerySchema', data),
    ).toBeUndefined();
});

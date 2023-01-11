import { validateSchema } from '../validate';
import { ExportQuerySchema } from './export-query-schema';

test('exportQuerySchema', () => {
    const data: ExportQuerySchema = {
        environment: 'production',
        features: ['firstFeature', 'secondFeature'],
    };

    expect(
        validateSchema('#/components/schemas/exportQuerySchema', data),
    ).toBeUndefined();
});

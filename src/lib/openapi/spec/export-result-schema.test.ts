import { validateSchema } from '../validate';
import { ExportResultSchema } from './export-result-schema';

test('exportResultSchema', () => {
    const data: ExportResultSchema = {
        features: [
            {
                name: 'test',
            },
        ],
        featureStrategies: [
            {
                name: 'test',
                constraints: [],
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/exportResultSchema', data),
    ).toBeUndefined();
});

import { Projection } from './projection';

test('should return set empty if missing', () => {
    const projection = new Projection();

    projection.substract('name-1', { yes: 1, no: 2 });

    expect(projection.getProjection()['name-1']).toEqual({ yes: 0, no: 0 });
});

test('should add and substract', () => {
    const projection = new Projection();

    expect(projection.store).toBeTruthy();

    projection.add('name-1', { yes: 1, no: 2 });
    expect(projection.getProjection()['name-1']).toEqual({ yes: 1, no: 2 });

    projection.add('name-1', { yes: 1, no: 2 });
    expect(projection.getProjection()['name-1']).toEqual({ yes: 2, no: 4 });

    projection.substract('name-1', { yes: 1, no: 2 });
    expect(projection.getProjection()['name-1']).toEqual({ yes: 1, no: 2 });

    projection.substract('name-1', { yes: 1, no: 2 });
    expect(projection.getProjection()['name-1']).toEqual({ yes: 0, no: 0 });

    projection.substract('name-2', { yes: 23213, no: 23213 });
    projection.add('name-2', { yes: 3, no: 2 });
    expect(projection.getProjection()['name-2']).toEqual({ yes: 3, no: 2 });
});

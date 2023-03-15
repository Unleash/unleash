import { uniqueByKey } from './unique';

test('should filter unique objects by key', () => {
    expect(
        uniqueByKey(
            [
                { name: 'name1', value: 'val1' },
                { name: 'name1', value: 'val1' },
                { name: 'name1', value: 'val2' },
                { name: 'name1', value: 'val4' },
                { name: 'name2', value: 'val5' },
            ],
            'name',
        ),
    ).toStrictEqual([
        { name: 'name1', value: 'val4' },
        { name: 'name2', value: 'val5' },
    ]);
});

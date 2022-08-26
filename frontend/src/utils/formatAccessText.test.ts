import { formatAccessText } from 'utils/formatAccessText';

test('formatAccessText with access', () => {
    expect(formatAccessText(true)).toEqual(undefined);
    expect(formatAccessText(true, 'Foo')).toEqual('Foo');
});

test('formatAccessText without access', () => {
    expect(formatAccessText(false)).toEqual('Access denied');
    expect(formatAccessText(false, 'Foo')).toEqual(`Foo (Access denied)`);
});

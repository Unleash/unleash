import { parseDateValue } from 'component/common/util';

test(`Date component is able to parse midnight when it's 00`, () => {
    const f = parseDateValue('2022-03-15T12:27');
    const midnight = parseDateValue('2022-03-15T00:27');
    expect(f).toEqual('2022-03-15T12:27');
    expect(midnight).toEqual('2022-03-15T00:27');
});

test(`Date component - snapshot matching`, () => {
    const midnight = '2022-03-15T00:00';
    const midday = '2022-03-15T12:00';
    const obj = {
        midnight: parseDateValue(midnight),
        midday: parseDateValue(midday),
    };
    expect(obj).toMatchSnapshot();
});

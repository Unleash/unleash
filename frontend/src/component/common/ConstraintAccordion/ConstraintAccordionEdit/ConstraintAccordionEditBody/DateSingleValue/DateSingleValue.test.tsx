import { parseDateValue } from 'component/common/ConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/DateSingleValue/DateSingleValue';

test(`Date component is able to parse midnight when it's 00`, () => {
    let f = parseDateValue('2022-03-15T12:27');
    let midnight = parseDateValue('2022-03-15T00:27');
    expect(f).toEqual('2022-03-15T12:27');
    expect(midnight).toEqual('2022-03-15T00:27');
});

test(`Date component - snapshot matching`, () => {
    let midnight = '2022-03-15T00:00';
    let midday = '2022-03-15T12:00';
    let obj = {
        midnight: parseDateValue(midnight),
        midday: parseDateValue(midday),
    };
    expect(obj).toMatchSnapshot();
});

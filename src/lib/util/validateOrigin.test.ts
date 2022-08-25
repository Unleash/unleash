import { validateOrigin } from './validateOrigin';

test('validateOrigin', () => {
    expect(validateOrigin(undefined)).toEqual(false);
    expect(validateOrigin('')).toEqual(false);
    expect(validateOrigin(' ')).toEqual(false);
    expect(validateOrigin('a')).toEqual(false);
    expect(validateOrigin('**')).toEqual(false);
    expect(validateOrigin('localhost')).toEqual(false);
    expect(validateOrigin('localhost:8080')).toEqual(false);
    expect(validateOrigin('//localhost:8080')).toEqual(false);
    expect(validateOrigin('http://localhost/')).toEqual(false);
    expect(validateOrigin('http://localhost/a')).toEqual(false);
    expect(validateOrigin('https://example.com/a')).toEqual(false);
    expect(validateOrigin('https://example.com ')).toEqual(false);
    expect(validateOrigin('https://*.example.com ')).toEqual(false);
    expect(validateOrigin('*.example.com')).toEqual(false);

    expect(validateOrigin('*')).toEqual(true);
    expect(validateOrigin('http://localhost')).toEqual(true);
    expect(validateOrigin('http://localhost:8080')).toEqual(true);
    expect(validateOrigin('https://example.com')).toEqual(true);
    expect(validateOrigin('https://example.com:8080')).toEqual(true);
});

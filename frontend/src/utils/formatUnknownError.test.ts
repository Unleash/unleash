import { formatUnknownError } from 'utils/formatUnknownError';

test('formatUnknownError', () => {
    expect(formatUnknownError(1)).toEqual('Unknown error');
    expect(formatUnknownError('1')).toEqual('1');
    expect(formatUnknownError(new Error('1'))).toEqual('1');
    expect(formatUnknownError(new Error())).toEqual('Error');
});

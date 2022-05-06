import { renderHook } from '@testing-library/react-hooks';
import {
    usePlausibleTracker,
    enablePlausibleTracker,
} from 'hooks/usePlausibleTracker';

test('usePlausibleTracker', async () => {
    const { result } = renderHook(() => usePlausibleTracker());
    expect(result.current).toBeUndefined();
});

test('enablePlausibleTracker', async () => {
    expect(enablePlausibleTracker({})).toEqual(false);
    expect(enablePlausibleTracker({ SE: true })).toEqual(false);
    expect(enablePlausibleTracker({ T: false })).toEqual(false);
    expect(enablePlausibleTracker({ T: true })).toEqual(true);
});

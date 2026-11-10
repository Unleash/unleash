import { expect, test, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { IntroSuccess } from './IntroSuccess.tsx';

test('replay and finish buttons wire to their callbacks', () => {
    const onReplay = vi.fn();
    const onComplete = vi.fn();
    render(<IntroSuccess onReplay={onReplay} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Replay intro' }));
    expect(onReplay).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(
        screen.getByRole('button', { name: 'Create feature flag' }),
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
});

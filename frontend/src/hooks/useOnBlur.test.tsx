import { render, screen, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { useOnBlur } from './useOnBlur.ts';

function TestComponent(props: { onBlurHandler: () => void }) {
    const divRef = useRef(null);
    useOnBlur(divRef, props.onBlurHandler);

    return (
        <div data-testid='wrapper'>
            {/* biome-ignore lint/a11y/noNoninteractiveTabindex: false positive / in a test */}
            <div tabIndex={0} data-testid='inside' ref={divRef}>
                Inside
            </div>
            {/* biome-ignore lint/a11y/noNoninteractiveTabindex: false positive / in a test */}
            <div tabIndex={0} data-testid='outside'>
                Outside
            </div>
        </div>
    );
}

test('should not call the callback when blurring within the same container', async () => {
    let mockCallbackCallCount = 0;
    const mockCallback = () => mockCallbackCallCount++;

    render(<TestComponent onBlurHandler={mockCallback} />);

    const insideDiv = screen.getByTestId('inside');

    insideDiv.focus();
    insideDiv.blur();

    await waitFor(() => {
        expect(mockCallbackCallCount).toBe(0);
    });
});

test('should call the callback when blurring outside of the container', async () => {
    let mockCallbackCallCount = 0;
    const mockCallback = () => mockCallbackCallCount++;

    render(<TestComponent onBlurHandler={mockCallback} />);

    const insideDiv = screen.getByTestId('inside');
    const outsideDiv = screen.getByTestId('outside');

    insideDiv.focus();
    outsideDiv.focus();

    await waitFor(() => {
        expect(mockCallbackCallCount).toBe(1);
    });
});

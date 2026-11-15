import { expect, test, vi } from 'vitest';
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
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

const Fixture = ({ onBlur }: { onBlur: () => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    useOnBlur(ref, onBlur);
    return (
        <>
            <div ref={ref}>
                <input aria-label='inside' />
                <input aria-label='second' />
            </div>
            <button type='button'>outside</button>
        </>
    );
};

const flushBlur = async () => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
    });
};

test('retains the inside-pointer exemption when mouseup precedes the deferred blur handler', async () => {
    const onBlur = vi.fn();
    render(<Fixture onBlur={onBlur} />);
    const input = screen.getByLabelText('inside');
    input.focus();
    fireEvent.mouseDown(input);
    screen.getByRole('button').focus();
    fireEvent.mouseUp(input);
    await flushBlur();
    expect(onBlur).not.toHaveBeenCalled();
});

test('does not fire when focus moves inside the container', async () => {
    const onBlur = vi.fn();
    render(<Fixture onBlur={onBlur} />);
    screen.getByLabelText('inside').focus();
    screen.getByLabelText('second').focus();
    await flushBlur();
    expect(onBlur).not.toHaveBeenCalled();
});

test.each([
    false,
    true,
])('fires on focus leaving the container (outside pointer: %s)', async (pointer) => {
    const onBlur = vi.fn();
    render(<Fixture onBlur={onBlur} />);
    screen.getByLabelText('inside').focus();
    const outside = screen.getByRole('button');
    if (pointer) fireEvent.mouseDown(outside);
    outside.focus();
    if (pointer) fireEvent.mouseUp(outside);
    await flushBlur();
    expect(onBlur).toHaveBeenCalledOnce();
});

import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useOnBlur } from './useOnBlur';

function TestComponent(props: { onBlurHandler: () => void }) {
    const divRef = useRef(null);
    useOnBlur(divRef, props.onBlurHandler);

    return (
        <div data-testid="wrapper">
            <div tabIndex={0} data-testid="inside" ref={divRef}>
                Inside
            </div>
            <div tabIndex={0} data-testid="outside">
                Outside
            </div>
        </div>
    );
}

test('should not call the callback when blurring within the same container', () => {
    let mockCallbackCallCount = 0;
    const mockCallback = () => mockCallbackCallCount++;

    render(<TestComponent onBlurHandler={mockCallback} />);

    const insideDiv = screen.getByTestId('inside');

    fireEvent.focus(insideDiv);
    fireEvent.blur(insideDiv);

    expect(mockCallbackCallCount).toBe(0);
});

test('should call the callback when blurring outside of the container', () => {
    let mockCallbackCallCount = 0;
    const mockCallback = () => mockCallbackCallCount++;

    render(<TestComponent onBlurHandler={mockCallback} />);

    const insideDiv = screen.getByTestId('inside');
    const outsideDiv = screen.getByTestId('outside');

    fireEvent.focus(insideDiv);
    fireEvent.focus(outsideDiv);

    expect(mockCallbackCallCount).toBe(1);
});

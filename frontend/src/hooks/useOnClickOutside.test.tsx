import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useOnClickOutside } from './useOnClickOutside.ts';

function TestComponent(props: { outsideClickHandler: () => void }) {
    const divRef = useRef(null);
    useOnClickOutside([divRef], props.outsideClickHandler);

    return (
        <div data-testid='wrapper'>
            <div data-testid='inside' ref={divRef}>
                Inside
            </div>
            <div data-testid='outside'>Outside</div>
        </div>
    );
}

test('should not call the callback when clicking inside', () => {
    let mockCallbackCallCount = 0;
    const mockCallback = () => mockCallbackCallCount++;

    render(<TestComponent outsideClickHandler={mockCallback} />);

    const insideDiv = screen.getByTestId('inside');

    // Simulate a click inside the div
    fireEvent.click(insideDiv);

    expect(mockCallbackCallCount).toBe(0);
});

test('should call the callback when clicking outside', () => {
    let mockCallbackCallCount = 0;
    const mockCallback = () => mockCallbackCallCount++;

    render(<TestComponent outsideClickHandler={mockCallback} />);

    const outsideDiv = screen.getByTestId('outside');

    fireEvent.click(outsideDiv);

    expect(mockCallbackCallCount).toBe(1);
});

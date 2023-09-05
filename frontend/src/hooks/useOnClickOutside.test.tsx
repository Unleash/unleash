import { render, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useRef } from 'react';
import { useOnClickOutside } from './useOnClickOutside';

function TestComponent(props: { outsideClickHandler: () => void }) {
    const divRef = useRef(null);
    useOnClickOutside([divRef], props.outsideClickHandler);

    return (
        <div data-testid="inside" ref={divRef}>
            Inside
        </div>
    );
}

test('should not call the callback when clicking inside', () => {
    let mockCallbackCallCount = 0;
    const mockCallback = () => mockCallbackCallCount++;

    const { getByTestId } = render(
        <TestComponent outsideClickHandler={mockCallback} />
    );
    const insideDiv = getByTestId('inside');

    // Simulate a click inside the div
    fireEvent.click(insideDiv);

    assert.equal(mockCallbackCallCount, 0);
});

test('should call the callback when clicking outside', () => {
    let mockCallbackCallCount = 0;
    const mockCallback = () => mockCallbackCallCount++;

    const { container } = render(
        <TestComponent outsideClickHandler={mockCallback} />
    );

    // Simulate a click outside the div
    act(() => {
        fireEvent.mouseDown(document.body);
    });

    assert.equal(mockCallbackCallCount, 1);
});

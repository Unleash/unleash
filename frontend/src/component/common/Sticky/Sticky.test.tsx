import { render, screen, cleanup } from '@testing-library/react';
import { Sticky } from './Sticky.tsx';
import { type IStickyContext, StickyContext } from './StickyContext.tsx';
import { vi, expect } from 'vitest';

describe('Sticky component', () => {
    let originalConsoleError: () => void;
    let mockRegisterStickyItem: () => void;
    let mockUnregisterStickyItem: () => void;
    let mockGetTopOffset: () => number;
    let mockContextValue: IStickyContext;

    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = vi.fn();

        mockRegisterStickyItem = vi.fn();
        mockUnregisterStickyItem = vi.fn();
        mockGetTopOffset = vi.fn(() => 10);

        mockContextValue = {
            registerStickyItem: mockRegisterStickyItem,
            unregisterStickyItem: mockUnregisterStickyItem,
            getTopOffset: mockGetTopOffset,
            stickyItems: [],
        };
    });

    afterEach(() => {
        cleanup();
        console.error = originalConsoleError;
    });

    it('renders correctly within StickyContext', () => {
        render(
            <StickyContext.Provider value={mockContextValue}>
                <Sticky>Content</Sticky>
            </StickyContext.Provider>,
        );

        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('throws error when not wrapped in StickyContext', () => {
        console.error = vi.fn();

        expect(() => render(<Sticky>Content</Sticky>)).toThrow(
            'Sticky component must be used within a StickyProvider',
        );
    });

    it('applies sticky positioning', () => {
        render(
            <StickyContext.Provider value={mockContextValue}>
                <Sticky>Content</Sticky>
            </StickyContext.Provider>,
        );

        const stickyElement = screen.getByText('Content');
        expect(stickyElement).toHaveStyle({ position: 'sticky' });
    });

    it('registers and unregisters sticky item on mount/unmount', () => {
        const { unmount } = render(
            <StickyContext.Provider value={mockContextValue}>
                <Sticky>Content</Sticky>
            </StickyContext.Provider>,
        );

        expect(mockRegisterStickyItem).toHaveBeenCalledTimes(1);

        unmount();

        expect(mockUnregisterStickyItem).toHaveBeenCalledTimes(1);
    });

    it('correctly sets the top value when mounted', async () => {
        render(
            <StickyContext.Provider value={mockContextValue}>
                <Sticky>Content</Sticky>
            </StickyContext.Provider>,
        );

        const stickyElement = await screen.findByText('Content');
        expect(stickyElement).toHaveStyle({ top: '10px' });
    });

    it('updates top offset when stickyItems changes', async () => {
        const { rerender } = render(
            <StickyContext.Provider value={mockContextValue}>
                <Sticky>Content</Sticky>
            </StickyContext.Provider>,
        );

        let stickyElement = await screen.findByText('Content');
        expect(stickyElement).toHaveStyle({ top: '10px' });

        const updatedMockContextValue = {
            ...mockContextValue,
            getTopOffset: vi.fn(() => 20),
        };

        rerender(
            <StickyContext.Provider value={updatedMockContextValue}>
                <Sticky>Content</Sticky>
            </StickyContext.Provider>,
        );

        stickyElement = await screen.findByText('Content');
        expect(stickyElement).toHaveStyle({ top: '20px' });
    });
});

import { render, cleanup } from '@testing-library/react';
import { StickyProvider } from './StickyProvider.tsx';
import { type IStickyContext, StickyContext } from './StickyContext.tsx';
import { expect } from 'vitest';
import { act } from 'react';

const defaultGetBoundingClientRect = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON() {},
};

describe('StickyProvider component', () => {
    afterEach(cleanup);

    it('provides the sticky context with expected functions', () => {
        let receivedContext: IStickyContext | undefined | null = null;
        render(
            <StickyProvider>
                <StickyContext.Consumer>
                    {(context) => {
                        receivedContext = context;
                        return null;
                    }}
                </StickyContext.Consumer>
            </StickyProvider>,
        );

        expect(receivedContext).not.toBeNull();
        expect(receivedContext).toHaveProperty('stickyItems');
        expect(receivedContext).toHaveProperty('registerStickyItem');
        expect(receivedContext).toHaveProperty('unregisterStickyItem');
        expect(receivedContext).toHaveProperty('getTopOffset');
    });

    it('registers and unregisters sticky items', () => {
        let contextValues: IStickyContext | undefined;
        const refMock = { current: document.createElement('div') };

        const { rerender } = render(
            <StickyProvider>
                <StickyContext.Consumer>
                    {(context) => {
                        contextValues = context;
                        return null;
                    }}
                </StickyContext.Consumer>
            </StickyProvider>,
        );

        contextValues?.registerStickyItem(refMock);
        rerender(
            <StickyProvider>
                <StickyContext.Consumer>
                    {(context) => {
                        contextValues = context;
                        return null;
                    }}
                </StickyContext.Consumer>
            </StickyProvider>,
        );

        expect(contextValues?.stickyItems).toContain(refMock);

        contextValues?.unregisterStickyItem(refMock);
        rerender(
            <StickyProvider>
                <StickyContext.Consumer>
                    {(context) => {
                        contextValues = context;
                        return null;
                    }}
                </StickyContext.Consumer>
            </StickyProvider>,
        );

        expect(contextValues?.stickyItems).not.toContain(refMock);
    });

    it('sorts sticky items based on their DOM position', () => {
        let contextValues: IStickyContext | undefined;

        const refMockA = { current: document.createElement('div') };
        const refMockB = { current: document.createElement('div') };

        refMockA.current.getBoundingClientRect = () => ({
            ...defaultGetBoundingClientRect,
            top: 200,
        });
        refMockB.current.getBoundingClientRect = () => ({
            ...defaultGetBoundingClientRect,
            top: 100,
        });

        render(
            <StickyProvider>
                <StickyContext.Consumer>
                    {(context) => {
                        contextValues = context;
                        return null;
                    }}
                </StickyContext.Consumer>
            </StickyProvider>,
        );

        act(() => {
            contextValues?.registerStickyItem(refMockA);
            contextValues?.registerStickyItem(refMockB);
        });

        expect(contextValues?.stickyItems[0]).toBe(refMockB);
        expect(contextValues?.stickyItems[1]).toBe(refMockA);
    });

    it('calculates top offset correctly', () => {
        let contextValues: IStickyContext | undefined;
        const refMockA = { current: document.createElement('div') };
        const refMockB = { current: document.createElement('div') };

        refMockA.current.getBoundingClientRect = () => ({
            ...defaultGetBoundingClientRect,
            height: 100,
        });

        refMockB.current.getBoundingClientRect = () => ({
            ...defaultGetBoundingClientRect,
            height: 200,
        });

        const { rerender } = render(
            <StickyProvider>
                <StickyContext.Consumer>
                    {(context) => {
                        contextValues = context;
                        return null;
                    }}
                </StickyContext.Consumer>
            </StickyProvider>,
        );

        contextValues?.registerStickyItem(refMockA);
        contextValues?.registerStickyItem(refMockB);
        rerender(
            <StickyProvider>
                <StickyContext.Consumer>
                    {(context) => {
                        contextValues = context;
                        return null;
                    }}
                </StickyContext.Consumer>
            </StickyProvider>,
        );

        const topOffset = contextValues?.getTopOffset(refMockB);
        expect(topOffset).toBe(100);
    });
});

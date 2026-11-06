import type { Unsubscribe } from './observePage.ts';

export type AppearObserver = (
    onAppear: (added: Element) => void,
) => Unsubscribe;

const NOT_VISIBLE_SELECTOR =
    'script, style, template, noscript, [hidden], [aria-hidden="true"]';

const isVisible = (element: Element): boolean =>
    element.closest(NOT_VISIBLE_SELECTOR) === null;

export const observeAppear = (
    onAppear: (added: Element) => void,
    root: Node,
): Unsubscribe => {
    const observer = new MutationObserver((mutations) => {
        for (const { addedNodes } of mutations) {
            for (const node of addedNodes) {
                if (
                    node instanceof Element &&
                    node.isConnected &&
                    isVisible(node)
                ) {
                    onAppear(node);
                }
            }
        }
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
};

export const observeBrowserAppear: AppearObserver = (onAppear) =>
    observeAppear(onAppear, document.body);

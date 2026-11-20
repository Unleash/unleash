import { beforeEach, expect, test } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { getLocalStorageItem } from 'utils/storage';
import { LayoutPicker } from './LayoutPicker.tsx';

const server = testServerSetup();

beforeEach(() => {
    localStorage.clear();
});

test('records visited pages in the new navigation', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { improvedSidebarNavigation: true },
    });
    render(<LayoutPicker>content</LayoutPicker>, {
        route: '/projects/default',
    });
    await screen.findByRole('region', { name: 'Workspace' });

    act(() => {
        window.history.pushState({}, '', '/projects/other');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await waitFor(() =>
        expect(getLocalStorageItem(':unleash-lastVisitedPages')).toEqual([
            { projectId: 'other' },
            { projectId: 'default' },
        ]),
    );
});

test('records visited pages in the classic navigation', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});

    render(<LayoutPicker>content</LayoutPicker>, {
        route: '/projects/default',
    });

    await waitFor(() =>
        expect(getLocalStorageItem(':unleash-lastVisitedPages')).toEqual([
            { projectId: 'default' },
        ]),
    );
});

test('does not record standalone pages', async () => {
    render(<LayoutPicker isStandalone>content</LayoutPicker>, {
        route: '/login',
    });
    await screen.findByText('content');

    expect(getLocalStorageItem(':unleash-lastVisitedPages')).toBeUndefined();
});

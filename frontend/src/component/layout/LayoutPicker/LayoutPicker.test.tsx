import { beforeEach, expect, test } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { getLocalStorageItem } from 'utils/storage';
import { setNewNavigationEnabled } from 'hooks/useNewNavigation';
import { HEADER_USER_AVATAR } from 'utils/testIds';
import { mockUserWithSplash } from 'component/onboarding/floatingChecklist/onboardingChecklistTestServer.ts';
import { LayoutPicker } from './LayoutPicker.tsx';

const server = testServerSetup();

beforeEach(() => {
    localStorage.clear();
});

test('records visited pages in the new navigation', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { improvedSidebarNavigation: true },
    });
    setNewNavigationEnabled(true);
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

const setupNewNavigationAvailable = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { improvedSidebarNavigation: true },
    });
    mockUserWithSplash(server, {});
};

const newNavigationToggle = () =>
    screen.findByRole('menuitemcheckbox', { name: /New navigation/ });

test('keeps the classic navigation until the user opts in', async () => {
    setupNewNavigationAvailable();
    render(<LayoutPicker>content</LayoutPicker>);

    await userEvent.click(await screen.findByTestId(HEADER_USER_AVATAR));

    expect(await newNavigationToggle()).toHaveAttribute(
        'aria-checked',
        'false',
    );
    expect(
        screen.queryByRole('region', { name: 'Workspace' }),
    ).not.toBeInTheDocument();
});

test('keeps the new navigation after a reload once opted in from the avatar menu', async () => {
    setupNewNavigationAvailable();
    const { unmount } = render(<LayoutPicker>content</LayoutPicker>);
    await userEvent.click(await screen.findByTestId(HEADER_USER_AVATAR));
    await userEvent.click(await newNavigationToggle());

    unmount();
    render(<LayoutPicker>content</LayoutPicker>);

    expect(
        await screen.findByRole('region', { name: 'Workspace' }),
    ).toBeInTheDocument();
});

test('switches back to the classic navigation from the settings menu', async () => {
    setupNewNavigationAvailable();
    setNewNavigationEnabled(true);
    render(<LayoutPicker>content</LayoutPicker>);

    await userEvent.click(
        await screen.findByRole('button', { name: /Settings/ }),
    );
    const toggle = await newNavigationToggle();
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(toggle);

    await waitFor(() =>
        expect(
            screen.queryByRole('region', { name: 'Workspace' }),
        ).not.toBeInTheDocument(),
    );
});

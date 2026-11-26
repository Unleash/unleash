import { beforeEach, expect, test } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
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

const newLayoutPopup = () =>
    screen.findByRole('region', { name: 'New layout available' });

const switchBackPopup = () =>
    screen.findByRole('region', { name: 'You are on the new layout' });

test('switches to the new navigation from the new layout popup', async () => {
    setupNewNavigationAvailable();
    render(<LayoutPicker>content</LayoutPicker>);

    await userEvent.click(
        within(await newLayoutPopup()).getByRole('button', {
            name: 'Try it now',
        }),
    );

    expect(
        await screen.findByRole('region', { name: 'Workspace' }),
    ).toBeInTheDocument();
    expect(await switchBackPopup()).toBeInTheDocument();
});

test('stops showing the new layout popup once the user has tried the new navigation', async () => {
    setupNewNavigationAvailable();
    render(<LayoutPicker>content</LayoutPicker>);
    await newLayoutPopup();
    await userEvent.click(await screen.findByTestId(HEADER_USER_AVATAR));
    await userEvent.click(await newNavigationToggle());

    await userEvent.click(
        await screen.findByRole('button', { name: /Settings/ }),
    );
    await userEvent.click(await newNavigationToggle());
    await screen.findByTestId(HEADER_USER_AVATAR);

    expect(
        screen.queryByRole('region', { name: 'New layout available' }),
    ).not.toBeInTheDocument();
});

test('keeps the new layout popup closed after a reload once dismissed', async () => {
    setupNewNavigationAvailable();
    const { unmount } = render(<LayoutPicker>content</LayoutPicker>);
    const popup = await newLayoutPopup();
    await userEvent.click(
        within(popup).getByRole('button', {
            name: 'Dismiss new layout popup',
        }),
    );
    expect(popup).not.toBeInTheDocument();

    unmount();
    render(<LayoutPicker>content</LayoutPicker>);

    await userEvent.click(await screen.findByTestId(HEADER_USER_AVATAR));
    await newNavigationToggle();
    // Without `hidden`, the open menu would hide the popup from this query:
    // the menu is modal, so it marks the rest of the page `aria-hidden`.
    expect(
        screen.queryByRole('region', {
            name: 'New layout available',
            hidden: true,
        }),
    ).not.toBeInTheDocument();
});

test('switches back to the classic navigation from the switch back popup', async () => {
    setupNewNavigationAvailable();
    setNewNavigationEnabled(true);
    render(<LayoutPicker>content</LayoutPicker>);

    await userEvent.click(
        within(await switchBackPopup()).getByRole('button', {
            name: 'Switch back',
        }),
    );

    await waitFor(() =>
        expect(
            screen.queryByRole('region', { name: 'Workspace' }),
        ).not.toBeInTheDocument(),
    );
});

test('keeps the switch back popup closed after a reload once dismissed', async () => {
    setupNewNavigationAvailable();
    setNewNavigationEnabled(true);
    const { unmount } = render(<LayoutPicker>content</LayoutPicker>);
    const popup = await switchBackPopup();
    await userEvent.click(
        within(popup).getByRole('button', {
            name: 'Dismiss switch back popup',
        }),
    );
    expect(popup).not.toBeInTheDocument();

    unmount();
    render(<LayoutPicker>content</LayoutPicker>);

    await screen.findByRole('region', { name: 'Workspace' });
    expect(
        screen.queryByRole('region', { name: 'You are on the new layout' }),
    ).not.toBeInTheDocument();
});

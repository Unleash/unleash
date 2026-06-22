import { beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CommandBar } from './CommandBar.tsx';

const server = testServerSetup();

const setViewportBelowMd = (belowMd: boolean) => {
    window.matchMedia = ((query: string) => ({
        matches: belowMd ? query.includes('max-width') : false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    })) as typeof window.matchMedia;
};

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/projects', { projects: [] });
});

test('collapses to a search icon below the md breakpoint', () => {
    setViewportBelowMd(true);

    render(<CommandBar />);

    expect(screen.getByRole('button', { name: /command menu/i })).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test('opens a search dialog when the icon is clicked and keeps it open', async () => {
    setViewportBelowMd(true);

    render(<CommandBar />);
    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );

    expect(await screen.findByRole('textbox')).toBeVisible();
});

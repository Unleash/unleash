import '@testing-library/jest-dom/vitest';
import { beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerSetup } from 'utils/testServer';
import { IntroProvider } from 'component/onboarding/intro/IntroProvider.tsx';
import { NewToUnleashBanner } from './NewToUnleashBanner.tsx';

testServerSetup();
beforeEach(() => localStorage.clear());

test('offers an introduction and resources without assuming a role or offering flag creation', async () => {
    render(<NewToUnleashBanner />);

    expect(
        await screen.findByRole('region', { name: 'New to Unleash?' }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Intro tour' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to docs' })).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/',
    );
    expect(
        screen.getByRole('link', { name: 'View architecture' }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/get-started/unleash-overview',
    );
    for (const link of screen.getAllByRole('link')) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(
        screen.queryByText(/viewer|create flag|setup prompt/i),
    ).not.toBeInTheDocument();
});

test('remembers dismissal when the banner is mounted again', async () => {
    const { unmount } = render(<NewToUnleashBanner />);
    await userEvent.click(
        await screen.findByRole('button', { name: 'Dismiss' }),
    );
    expect(
        screen.queryByRole('region', { name: 'New to Unleash?' }),
    ).not.toBeInTheDocument();

    unmount();
    render(<NewToUnleashBanner />);
    expect(
        screen.queryByRole('region', { name: 'New to Unleash?' }),
    ).not.toBeInTheDocument();
});

test('opens the existing Unleash intro tour', async () => {
    render(
        <IntroProvider>
            <NewToUnleashBanner />
        </IntroProvider>,
    );
    await userEvent.click(
        await screen.findByRole('button', { name: 'Intro tour' }),
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
});

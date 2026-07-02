import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpResources } from './HelpResources';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const openFeedback = vi.fn();
vi.mock('component/feedbackNew/useFeedback', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('component/feedbackNew/useFeedback')
        >();
    return { ...actual, useFeedback: () => ({ openFeedback }) };
});

const trackEvent = vi.fn();
vi.mock('hooks/useEventTracker', () => ({
    useEventTracker: () => ({ trackEvent }),
}));

const withLearningLab = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { learningLab: true },
    });

test('opens help menu with all items when clicking the button', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(screen.getByText('Visit Learning Lab')).toBeInTheDocument();
    expect(
        screen.getByRole('menuitem', { name: 'Learning Lab' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Give feedback')).toBeInTheDocument();
    expect(screen.getByText('Slack community')).toBeInTheDocument();
});

test('external links have correct hrefs', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(screen.getByText('Visit Learning Lab').closest('a')).toHaveAttribute(
        'href',
        'https://learning.getunleash.io/',
    );
    expect(
        screen.getByRole('menuitem', { name: 'Learning Lab' }),
    ).toHaveAttribute('href', 'https://learning.getunleash.io/');
    expect(screen.getByText('Documentation').closest('a')).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/',
    );
    expect(screen.getByText('GitHub').closest('a')).toHaveAttribute(
        'href',
        'https://github.com/Unleash/unleash',
    );
    expect(screen.getByText('Slack community').closest('a')).toHaveAttribute(
        'href',
        'https://slack.unleash.run/',
    );
});

test('give feedback calls openFeedback with the correct title and labels', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    await userEvent.click(screen.getByText('Give feedback'));

    expect(openFeedback).toHaveBeenCalledWith({
        title: 'How would you rate your overall experience with Unleash?',
        positiveLabel: "What's working well for you in Unleash?",
        areasForImprovementsLabel:
            'What could be improved to make Unleash work better for you? ',
    });
});

test("What's new item shows when enterprise and flag are enabled", async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { whatsNewPage: true },
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(
        screen.getByRole('menuitem', { name: /What's new/ }),
    ).toHaveAttribute('href', '/whats-new');
});

test("What's new item is hidden on enterprise without the flag", async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { whatsNewPage: false },
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(
        screen.queryByRole('menuitem', { name: /What's new/ }),
    ).not.toBeInTheDocument();
});

test("What's new item is hidden on non-enterprise even with the flag", async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { whatsNewPage: true },
    });
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(
        screen.queryByRole('menuitem', { name: /What's new/ }),
    ).not.toBeInTheDocument();
});

test('tracks menu open and item click', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(trackEvent).toHaveBeenCalledWith('help-resources', {
        props: { eventType: 'opened' },
    });

    await userEvent.click(screen.getByText('GitHub'));

    expect(trackEvent).toHaveBeenCalledWith('help-resources', {
        props: { eventType: 'click', option: 'github' },
    });
});

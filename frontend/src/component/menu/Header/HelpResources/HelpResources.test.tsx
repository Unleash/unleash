import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpResources } from './HelpResources';

const openFeedback = vi.fn();
vi.mock('component/feedbackNew/useFeedback', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('component/feedbackNew/useFeedback')
        >();
    return { ...actual, useFeedback: () => ({ openFeedback }) };
});

test('opens help menu with all items when clicking the button', async () => {
    render(<HelpResources />);

    await userEvent.click(
        screen.getByRole('button', { name: 'Help and resources' }),
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
    render(<HelpResources />);

    await userEvent.click(
        screen.getByRole('button', { name: 'Help and resources' }),
    );

    expect(screen.getByText('Visit Learning Lab').closest('a')).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/',
    );
    expect(
        screen.getByRole('menuitem', { name: 'Learning Lab' }),
    ).toHaveAttribute('href', 'https://docs.getunleash.io/');
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
    render(<HelpResources />);

    await userEvent.click(
        screen.getByRole('button', { name: 'Help and resources' }),
    );

    await userEvent.click(screen.getByText('Give feedback'));

    expect(openFeedback).toHaveBeenCalledWith({
        title: 'How easy is it to use Unleash?',
        positiveLabel: 'What do you like most about Unleash?',
        areasForImprovementsLabel: 'What should be improved in Unleash?',
    });
});

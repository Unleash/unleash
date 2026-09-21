import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { PageHeader } from './PageHeader.tsx';

test('the page title renders as a level-1 heading by default', () => {
    render(<PageHeader title='My page' />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'My page',
    );
});

test('setting secondary does not change the heading level', () => {
    render(<PageHeader title='My section' secondary />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'My section',
    );
});

test('the heading level follows the passed variant', () => {
    render(<PageHeader title='My header' variant='h3' />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'My header',
    );
});

test('the page title becomes the browser tab title', () => {
    document.title = 'Some page';
    render(<PageHeader title='My page' />);

    expect(document.title).toBe('My page');
});

test('an explicit variant changes the heading style without giving up the browser tab title', () => {
    render(<PageHeader title='My page' variant='h2' />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'My page',
    );
    expect(document.title).toBe('My page');
});

test("when setting secondary, the header's title does not become the browser tab title", () => {
    document.title = 'Title claimed by the primary header';

    render(<PageHeader title='My section' secondary />);

    expect(document.title).toBe('Title claimed by the primary header');
});

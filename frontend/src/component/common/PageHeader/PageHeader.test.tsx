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

test('a header with a heading leaves the browser tab title alone', () => {
    document.title = 'Title claimed by the page';

    render(<PageHeader heading='My section' />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'My section',
    );
    expect(document.title).toBe('Title claimed by the page');
});

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ChecklistStep, ChecklistSteps } from './ChecklistSteps.tsx';

const step = (overrides: Partial<ChecklistStep> = {}): ChecklistStep => ({
    key: 'default-key',
    title: 'default title',
    body: 'default body',
    done: false,
    action: null,
    ...overrides,
});

test('expands the first incomplete step so the user lands on the next thing to do', () => {
    render(
        <ChecklistSteps
            steps={[
                step({ key: 'a', title: 'Alpha', done: true }),
                step({ key: 'b', title: 'Bravo', done: false }),
                step({ key: 'c', title: 'Charlie', done: false }),
            ]}
        />,
    );

    expect(screen.getByRole('button', { name: /Alpha/ })).toHaveAttribute(
        'aria-expanded',
        'false',
    );
    expect(screen.getByRole('button', { name: /Bravo/ })).toHaveAttribute(
        'aria-expanded',
        'true',
    );
    expect(screen.getByRole('button', { name: /Charlie/ })).toHaveAttribute(
        'aria-expanded',
        'false',
    );
});

test('advances the expansion to the next incomplete step once the current one is marked done', () => {
    const { rerender } = render(
        <ChecklistSteps
            steps={[
                step({ key: 'a', title: 'Alpha', done: false }),
                step({ key: 'b', title: 'Bravo', done: false }),
            ]}
        />,
    );

    expect(screen.getByRole('button', { name: /Alpha/ })).toHaveAttribute(
        'aria-expanded',
        'true',
    );

    rerender(
        <ChecklistSteps
            steps={[
                step({ key: 'a', title: 'Alpha', done: true }),
                step({ key: 'b', title: 'Bravo', done: false }),
            ]}
        />,
    );

    expect(screen.getByRole('button', { name: /Bravo/ })).toHaveAttribute(
        'aria-expanded',
        'true',
    );
});

test('collapses everything once every step is done', () => {
    render(
        <ChecklistSteps
            steps={[
                step({ key: 'a', title: 'Alpha', done: true }),
                step({ key: 'b', title: 'Bravo', done: true }),
            ]}
        />,
    );

    expect(screen.getByRole('button', { name: /Alpha/ })).toHaveAttribute(
        'aria-expanded',
        'false',
    );
    expect(screen.getByRole('button', { name: /Bravo/ })).toHaveAttribute(
        'aria-expanded',
        'false',
    );
});

test('lets the user reopen a completed step to revisit its instructions', async () => {
    render(
        <ChecklistSteps
            steps={[
                step({ key: 'a', title: 'Alpha', done: true }),
                step({ key: 'b', title: 'Bravo', done: false }),
            ]}
        />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Alpha/ }));

    expect(screen.getByRole('button', { name: /Alpha/ })).toHaveAttribute(
        'aria-expanded',
        'true',
    );
});

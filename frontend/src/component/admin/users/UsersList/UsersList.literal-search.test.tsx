import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import UsersList from './UsersList';

describe('UsersList literal user search', () => {
    const server = testServerSetup();
    test.each([
        ["O'Connor", 'person-one@example.test', true],
        ["o'connor", 'person-one@example.test', true],
        ["  O'Connor  ", 'person-one@example.test', true],
        ['Doe, John', 'jdoe@example.test', true],
        ['John', 'jdoe@example.test', true],
        ['jdoe', 'jdoe@example.test', true],
        ['jdoe@example.test', 'jdoe@example.test', true],
        ['missing-user', 'jdoe@example.test', false],
        ['Doe,John', 'jdoe@example.test', false],
        ['OConnor', 'person-one@example.test', false],
    ])('matches literal query %s', async (query, email, matches) => {
        testServerRoute(server, '/api/admin/ui-config', {
            environment: 'OSS',
            versionInfo: { current: {} },
            flags: {},
        });
        testServerRoute(server, '/api/admin/user-admin', {
            users: [
                {
                    id: 1,
                    name: "O'Connor",
                    username: 'person-one',
                    email: 'person-one@example.test',
                    rootRole: 1,
                    createdAt: '2026-11-01T00:00:00Z',
                },
                {
                    id: 2,
                    name: 'Doe, John',
                    username: 'jdoe',
                    email: 'jdoe@example.test',
                    rootRole: 1,
                    createdAt: '2026-11-01T00:00:00Z',
                },
            ],
            rootRoles: [{ id: 1, name: 'Admin', type: 'root' }],
        });
        const { rerender } = render(<UsersList searchValue='' />);
        expect(await screen.findByText(email)).toBeInTheDocument();
        rerender(<UsersList searchValue={query} />);
        const result = screen.queryByText(
            (_, element) =>
                element?.textContent === email &&
                !Array.from(element.children).some(
                    (child) => child.textContent === email,
                ),
        );
        if (matches) {
            expect(result).toBeInTheDocument();
        } else {
            expect(result).not.toBeInTheDocument();
        }
        rerender(<UsersList searchValue='' />);
        expect(screen.getByText(email)).toBeInTheDocument();
    });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import UserProfileContainer from './index.tsx';

vi.mock('hooks/api/getters/useAuth/useAuthUser', () => ({
    useAuthUser: vi.fn(),
}));

vi.mock('./UserProfile.tsx', () => ({
    UserProfile: ({ profile }: { profile: { name: string } }) => (
        <div>User profile: {profile.name}</div>
    ),
}));

const mockedUseAuthUser = vi.mocked(useAuthUser);

describe('UserProfileContainer', () => {
    test('renders profile dropdown when user is available', () => {
        mockedUseAuthUser.mockReturnValue({
            user: { name: 'Alice' },
        } as never);

        render(<UserProfileContainer />);

        expect(screen.getByText('User profile: Alice')).toBeInTheDocument();
    });

    test('renders nothing when user is missing', () => {
        mockedUseAuthUser.mockReturnValue({ user: null } as never);

        render(<UserProfileContainer />);

        expect(screen.queryByText(/^User profile:/)).not.toBeInTheDocument();
    });
});

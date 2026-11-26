import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { HEADER_USER_AVATAR } from 'utils/testIds';
import type { IUser } from 'interfaces/user';
import { UserProfile } from './UserProfile.tsx';

const profile = {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
} as IUser;

test('keeps the page scrollable while the profile menu is open', async () => {
    render(<UserProfile profile={profile} />);

    await userEvent.click(screen.getByTestId(HEADER_USER_AVATAR));
    await screen.findByRole('menuitem', { name: 'Profile settings' });

    expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
});

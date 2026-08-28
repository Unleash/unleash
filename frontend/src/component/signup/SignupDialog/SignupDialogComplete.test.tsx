import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { expect, test, vi } from 'vitest';
import { SignupDialogComplete } from './SignupDialogComplete.tsx';

vi.mock('hooks/useUiFlag', () => ({
    useUiFlag: () => true,
}));

const signupData = {
    password: '',
    name: '',
    companyRole: '',
    companyName: '',
    companyIsNA: false,
    productUpdatesEmailConsent: false,
    inviteEmails: [],
};

test('presents Unleash Intro as a playful, interactive experience', async () => {
    const onNext = vi.fn();

    render(
        <SignupDialogComplete
            data={signupData}
            setData={vi.fn()}
            onNext={onNext}
        />,
    );

    expect(screen.getByText('Welcome to Unleash')).toBeInTheDocument();
    expect(
        screen.getByText("Choose how you'd like to get started."),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('heading', { name: 'Learn the basics' }),
    ).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(
        screen.getByRole('heading', { name: 'Set up a project' }),
    ).toBeInTheDocument();
    expect(
        screen.getByText(
            'You can reopen Unleash Intro at any time from the Help menu.',
        ),
    ).toBeInTheDocument();

    await userEvent.click(
        screen.getByRole('button', { name: 'Learn the basics' }),
    );
    expect(onNext).toHaveBeenLastCalledWith('tour');

    await userEvent.click(screen.getByRole('button', { name: 'Open Unleash' }));
    expect(onNext).toHaveBeenLastCalledWith('complete');
});

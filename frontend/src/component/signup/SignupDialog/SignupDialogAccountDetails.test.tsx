import { screen } from '@testing-library/react';
import { ADMIN } from 'component/providers/AccessProvider/permissions.ts';
import { render } from 'utils/testRenderer.tsx';
import { describe, expect, test, vi } from 'vitest';
import { SignupDialogAccountDetails } from './SignupDialogAccountDetails.tsx';

const data = {
    password: '',
    name: '',
    companyRole: '',
    companyName: '',
    companyIsNA: false,
    hearAboutUs: '',
    productUpdatesEmailConsent: false,
};

const HEAR_ABOUT_US_LABEL = 'How did you hear about us? (optional)';

describe('signup account details', () => {
    test('does not request company information from non-admins', () => {
        render(
            <SignupDialogAccountDetails
                data={data}
                setData={vi.fn()}
                onNext={vi.fn()}
                signupData={{}}
            />,
        );

        expect(screen.queryByText('Company name')).not.toBeInTheDocument();
        expect(
            screen.queryByText('My company is based in North America'),
        ).not.toBeInTheDocument();
        expect(screen.queryByText(HEAR_ABOUT_US_LABEL)).not.toBeInTheDocument();
    });

    test('requests company information from admins when it is missing', () => {
        render(
            <SignupDialogAccountDetails
                data={data}
                setData={vi.fn()}
                onNext={vi.fn()}
                signupData={{}}
            />,
            { permissions: [{ permission: ADMIN }] },
        );

        expect(screen.getByText('Company name')).toBeInTheDocument();
        expect(
            screen.getByText('My company is based in North America'),
        ).toBeInTheDocument();
        expect(screen.getByText(HEAR_ABOUT_US_LABEL)).toBeInTheDocument();
    });

    test('does not ask admins how they heard about us when the company already exists', () => {
        render(
            <SignupDialogAccountDetails
                data={data}
                setData={vi.fn()}
                onNext={vi.fn()}
                signupData={{ companyName: 'Acme' }}
            />,
            { permissions: [{ permission: ADMIN }] },
        );

        expect(screen.queryByText(HEAR_ABOUT_US_LABEL)).not.toBeInTheDocument();
    });

    test('does not require an answer to how they heard about us', () => {
        render(
            <SignupDialogAccountDetails
                data={{
                    ...data,
                    name: 'Jane',
                    companyRole: 'Developer',
                    companyName: 'Acme',
                }}
                setData={vi.fn()}
                onNext={vi.fn()}
                signupData={{}}
            />,
            { permissions: [{ permission: ADMIN }] },
        );

        expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });
});

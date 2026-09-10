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
    productUpdatesEmailConsent: false,
    inviteEmails: [],
};

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
    });
});

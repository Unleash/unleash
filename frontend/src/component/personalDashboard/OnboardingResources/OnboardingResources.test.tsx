import '@testing-library/jest-dom/vitest';
import { expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerSetup } from 'utils/testServer';
import { OnboardingResources } from './OnboardingResources.tsx';

testServerSetup();

test('offers documentation, architecture, and learning resources', async () => {
    render(<OnboardingResources edition='enterprise' />);

    const help = await screen.findByRole('region', { name: 'Need help?' });

    expect(
        within(help).getByRole('link', { name: 'Go to docs' }),
    ).toHaveAttribute('href', 'https://docs.getunleash.io/');
    expect(
        within(help).getByRole('link', { name: 'View architecture' }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/get-started/unleash-overview',
    );
    expect(
        within(help).getByRole('link', { name: 'Learning lab' }),
    ).toHaveAttribute('href', 'https://learning.getunleash.io/');
    for (const link of screen.getAllByRole('link')) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
});

test('offers OSS migration guidance on Enterprise', async () => {
    render(<OnboardingResources edition='enterprise' />);

    const migration = await screen.findByRole('region', {
        name: 'Import from open source?',
    });

    expect(
        within(migration).getByRole('link', { name: 'Import from OSS' }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/guides/migrate-from-open-source',
    );
    expect(
        screen.queryByText('Try Unleash Enterprise'),
    ).not.toBeInTheDocument();
});

test('offers Enterprise upgrades instead of importing on OSS', async () => {
    render(<OnboardingResources edition='oss' />);

    const upgrade = await screen.findByRole('region', {
        name: 'Get unlimited projects and environments',
    });

    expect(
        within(upgrade).getByText('Try Unleash Enterprise'),
    ).toBeInTheDocument();
    const benefits = within(upgrade).getAllByRole('listitem');
    expect(benefits.map((item) => item.textContent)).toEqual([
        'Unlimited projects and environments',
        'Priority support for managed and self-hosted options',
        'SSO/SCIM - streamlined access and account management',
        'RBAC - precise access control',
        'Change requests - reduce error risk with pull-request like experience',
    ]);
    const link = within(upgrade).getByRole('link', {
        name: 'View full Enterprise offering',
    });
    expect(link).toHaveAttribute(
        'href',
        'https://www.getunleash.io/upgrade-unleash?utm_source=oss&utm_medium=feature&utm_content=dashboard',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
        screen.queryByRole('link', { name: 'Import from OSS' }),
    ).not.toBeInTheDocument();
});

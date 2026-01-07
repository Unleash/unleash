import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiTokenIcon, isOrphanedToken } from './ApiTokenIcon.tsx';

describe('isOrphanedToken', () => {
    it('should be true for wildcard tokens with secret indicating it is orphaned', () => {
        expect(
            isOrphanedToken({
                secret: '[]:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b',
                projects: ['*'],
                project: '*',
            }),
        ).toBe(true);
        expect(
            isOrphanedToken({
                secret: 'test:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b',
                projects: ['*'],
                project: '*',
            }),
        ).toBe(true);
    });

    it('should be false for true wildcard tokens', () => {
        expect(
            isOrphanedToken({
                secret: '*:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b',
                projects: ['*'],
                project: '*',
            }),
        ).toBe(false);
    });

    it('should be false for secrets in v1 format', () => {
        expect(
            isOrphanedToken({
                secret: 'be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178',
                projects: ['*'],
                project: '*',
            }),
        ).toBe(false);
    });

    it('should be false if there are projects assigned to a token', () => {
        expect(
            isOrphanedToken({
                secret: 'test:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b',
                projects: ['test'],
                project: 'test',
            }),
        ).toBe(false);
        expect(
            isOrphanedToken({
                secret: '[]:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b',
                projects: ['a', 'b'],
            }),
        ).toBe(false);
        expect(
            isOrphanedToken({
                secret: '[]:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b',
                projects: ['a'],
            }),
        ).toBe(false);
    });
});

describe('ApiTokenIcon', () => {
    it('should show warning icon if it is an orphaned token', async () => {
        render(
            <ApiTokenIcon secret='test:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b' />,
        );

        const errorIcon = await screen.findByTestId('orphaned-token-icon');
        expect(errorIcon).toBeInTheDocument();
    });

    it('should show tooltip with warning message if it is an orphaned token', async () => {
        const user = userEvent.setup();
        render(
            <ApiTokenIcon
                secret='test:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b'
                projects={[]}
            />,
        );

        const errorIcon = await screen.findByTestId('orphaned-token-icon');
        user.hover(errorIcon);

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent(/orphaned token/);
    });

    it('should not show warning for true wildcard tokens', async () => {
        render(
            <ApiTokenIcon
                secret='*:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b'
                project='*'
                projects={['*']}
            />,
        );

        const errorIcon = await screen.queryByTestId('orphaned-token-icon');
        expect(errorIcon).toBeNull();
    });
});

import { test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { TokenCreated } from './TokenCreated.tsx';

const server = testServerSetup();

test('keeps the frontend SDK snippet valid for a name with an apostrophe', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    render(
        <TokenCreated
            appName="bob's-app"
            tokenName='web'
            type='FRONTEND'
            secret='*:production.secret'
            onDone={() => {}}
        />,
    );

    await screen.findByText(/clientKey: process\.env/);
    screen.getByText(/appName: 'bob\\'s-app',/);
});

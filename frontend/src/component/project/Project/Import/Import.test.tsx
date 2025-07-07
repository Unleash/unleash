import { render } from 'utils/testRenderer';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ImportModal } from './ImportModal.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import userEvent from '@testing-library/user-event';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { enterprise: 'present' },
        },
    });
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [
            { environment: 'development' },
            { environment: 'production' },
        ],
    });
    testServerRoute(
        server,
        '/api/admin/features-batch/validate',
        { errors: [], permissions: [], warnings: [] },
        'post',
    );
    testServerRoute(server, '/api/admin/features-batch/import', {}, 'post');
};

const importFile = async (content: string) => {
    const selectFileInput = screen.getByTestId('import-file');
    const importFile = new File([content], 'import.json', {
        type: 'application/json',
    });
    await userEvent.upload(selectFileInput, importFile);
};

test('Import happy path', async () => {
    setupApi();
    let closed = false;
    const setOpen = (open: boolean) => {
        closed = !open;
    };
    render(<ImportModal open={true} setOpen={setOpen} project='default' />, {
        permissions: [{ permission: CREATE_FEATURE }],
    });

    // configure stage
    screen.getByText('Import options');
    screen.getByText('Drop your file here');
    const validateButton = screen.getByText('Validate');
    expect(validateButton).toBeDisabled();

    await importFile('{}');
    await waitFor(() => {
        expect(screen.getByText('Validate')).toBeEnabled();
    });

    const codeEditorLabel = screen.getByText('Code editor');
    codeEditorLabel.click();
    const editor = screen.getByLabelText('Exported feature flags');
    expect(editor.textContent).toBe('{}');

    screen.getByText('Validate').click();

    // validate stage
    await screen.findByText('You are importing this configuration in:');
    await screen.findByText('development');
    await screen.findByText('default');
    const importButton = await screen.findByText('Import configuration');
    expect(importButton).toBeEnabled();

    fireEvent.click(importButton);

    // import stage
    await screen.findByText('Importing...');
    await screen.findByText('Import completed');

    expect(closed).toBe(false);
    const closeButton = screen.getByText('Close');
    closeButton.click();
    expect(closed).toBe(true);
});

test('Block when importing non json content', async () => {
    setupApi();
    const setOpen = () => {};
    render(<ImportModal open={true} setOpen={setOpen} project='default' />, {
        permissions: [{ permission: CREATE_FEATURE }],
    });

    const codeEditorLabel = screen.getByText('Code editor');
    codeEditorLabel.click();
    const editor = await screen.findByLabelText('Exported feature flags');
    await userEvent.type(editor, 'invalid non json');

    const validateButton = screen.getByText('Validate');
    expect(validateButton).toBeDisabled();
});

test('Show validation errors', async () => {
    setupApi();
    testServerRoute(
        server,
        '/api/admin/features-batch/validate',
        {
            errors: [
                { message: 'error message', affectedItems: ['itemC', 'itemD'] },
            ],
            permissions: [
                {
                    message: 'permission message',
                    affectedItems: ['itemE', 'itemF'],
                },
            ],
            warnings: [
                {
                    message: 'warning message',
                    affectedItems: ['itemA', 'itemB'],
                },
            ],
        },
        'post',
    );
    const setOpen = () => {};
    render(<ImportModal open={true} setOpen={setOpen} project='default' />, {
        permissions: [{ permission: CREATE_FEATURE }],
    });

    await importFile('{}');
    await waitFor(() => {
        expect(screen.getByText('Validate')).toBeEnabled();
    });

    screen.getByText('Validate').click();

    await screen.findByText('warning message');
    await screen.findByText('itemA');
    await screen.findByText('itemB');

    await screen.findByText('error message');
    await screen.findByText('itemC');
    await screen.findByText('itemD');

    await screen.findByText('permission message');
    await screen.findByText('itemE');
    await screen.findByText('itemF');

    const importButton = screen.getByText('Import configuration');
    expect(importButton).toHaveAttribute('aria-disabled', 'true');
});

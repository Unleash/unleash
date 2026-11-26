import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { JsonFileUploadButton } from './JsonFileUploadButton.tsx';

test('opens the file picker, passes on the parsed JSON of an uploaded file and rejects a file that is not JSON', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(
        <JsonFileUploadButton
            maxBytes={1024}
            onLoad={onLoad}
            onError={onError}
        />,
    );
    const fileInput = screen.getByTestId('json-file-input');
    let pickerOpened = false;
    fileInput.addEventListener('click', () => {
        pickerOpened = true;
    });

    await userEvent.click(screen.getByRole('button', { name: 'Upload .json' }));
    expect(pickerOpened).toBe(true);

    await userEvent.upload(fileInput, new File(['{"type":'], 'broken.json'));
    await waitFor(() =>
        expect(onError).toHaveBeenCalledWith('The file is not valid JSON'),
    );
    expect(onLoad).not.toHaveBeenCalled();

    await userEvent.upload(
        fileInput,
        new File(['{"type":"string"}'], 'schema.json'),
    );
    await waitFor(() =>
        expect(onLoad).toHaveBeenCalledWith({ type: 'string' }),
    );
});

test('rejects a file over the size limit, a file of another type and several files at once', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(
        <JsonFileUploadButton
            maxBytes={1024}
            onLoad={onLoad}
            onError={onError}
        />,
    );
    const fileInput = screen.getByTestId('json-file-input');
    const user = userEvent.setup({ applyAccept: false });

    await user.upload(fileInput, new File(['1'.repeat(1025)], 'big.json'));
    await user.upload(
        fileInput,
        new File(['{}'], 'schema.yaml', { type: 'application/yaml' }),
    );
    await user.upload(fileInput, [
        new File(['{}'], 'first.json'),
        new File(['{}'], 'second.json'),
    ]);

    await waitFor(() =>
        expect(onError.mock.calls).toEqual([
            ['The file is larger than 1 kB'],
            ['Only .json files can be uploaded'],
            ['Upload one file at a time'],
        ]),
    );
    expect(onLoad).not.toHaveBeenCalled();
});

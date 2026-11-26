import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { JsonFileUploadButton } from './JsonFileUploadButton.tsx';

test('opens the file picker, passes on the parsed JSON of an uploaded file and rejects a file that is not JSON', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(<JsonFileUploadButton onLoad={onLoad} onError={onError} />);
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

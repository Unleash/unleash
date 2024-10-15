import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderEnvironmentsDialog } from './OrderEnvironmentsDialog';

describe('OrderEnvironmentsDialog Component', () => {
    const renderComponent = (props = {}) =>
        render(
            <OrderEnvironmentsDialog
                open={true}
                onClose={() => {}}
                onSubmit={() => {}}
                {...props}
            />,
        );

    test('should disable "Order" button until the checkbox is checked', () => {
        renderComponent();

        const orderButton = screen.getByRole('button', { name: /order/i });
        const checkbox = screen.getByRole('checkbox', {
            name: /i understand adding environments leads to extra costs/i,
        });

        expect(orderButton).toBeDisabled();

        fireEvent.click(checkbox);

        expect(orderButton).toBeEnabled();
    });

    test('should render correct number of environment name inputs based on selected environments', () => {
        renderComponent();

        let environmentInputs =
            screen.getAllByLabelText(/environment \d+ name/i);
        expect(environmentInputs).toHaveLength(1);

        const selectButton = screen.getByRole('combobox', {
            name: /select the number of additional environments/i,
        });
        fireEvent.mouseDown(selectButton);

        const option2 = screen.getByRole('option', { name: '2 environments' });
        fireEvent.click(option2);

        environmentInputs = screen.getAllByLabelText(/environment \d+ name/i);
        expect(environmentInputs).toHaveLength(2);

        fireEvent.mouseDown(selectButton);
        const option3 = screen.getByRole('option', { name: '3 environments' });
        fireEvent.click(option3);

        environmentInputs = screen.getAllByLabelText(/environment \d+ name/i);
        expect(environmentInputs).toHaveLength(3);
    });

    test('should enable "Order" button only when checkbox is checked', () => {
        renderComponent();

        const orderButton = screen.getByRole('button', { name: /order/i });
        const checkbox = screen.getByRole('checkbox', {
            name: /i understand adding environments leads to extra costs/i,
        });

        expect(orderButton).toBeDisabled();

        fireEvent.click(checkbox);

        expect(orderButton).toBeEnabled();

        fireEvent.click(checkbox);

        expect(orderButton).toBeDisabled();
    });

    test('should output environment names', () => {
        const onSubmitMock = vi.fn();
        renderComponent({ onSubmit: onSubmitMock });

        const selectButton = screen.getByRole('combobox', {
            name: /select the number of additional environments/i,
        });
        fireEvent.mouseDown(selectButton);

        const option2 = screen.getByRole('option', { name: '2 environments' });
        fireEvent.click(option2);

        const environmentInputs =
            screen.getAllByLabelText(/environment \d+ name/i);

        fireEvent.change(environmentInputs[0], { target: { value: 'Dev' } });
        fireEvent.change(environmentInputs[1], {
            target: { value: 'Staging' },
        });
        const checkbox = screen.getByRole('checkbox', {
            name: /i understand adding environments leads to extra costs/i,
        });
        fireEvent.click(checkbox);

        const submitButton = screen.getByRole('button', { name: /order/i });
        fireEvent.click(submitButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith([
            { name: 'Dev', type: 'development' },
            { name: 'Staging', type: 'development' },
        ]);
    });

    test('should call onClose when "Cancel" button is clicked', () => {
        const onCloseMock = vi.fn();
        renderComponent({ onClose: onCloseMock });

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    test('should adjust environment name inputs when decreasing environments', () => {
        const onSubmitMock = vi.fn();
        renderComponent({ onSubmit: onSubmitMock });

        const selectButton = screen.getByRole('combobox', {
            name: /select the number of additional environments/i,
        });
        fireEvent.mouseDown(selectButton);

        const option3 = screen.getByRole('option', { name: '3 environments' });
        fireEvent.click(option3);

        let environmentInputs =
            screen.getAllByLabelText(/environment \d+ name/i);
        expect(environmentInputs).toHaveLength(3);

        fireEvent.change(environmentInputs[0], { target: { value: 'Dev' } });
        fireEvent.change(environmentInputs[1], {
            target: { value: 'Staging' },
        });
        fireEvent.change(environmentInputs[2], { target: { value: 'Prod' } });

        fireEvent.mouseDown(selectButton);
        const option2 = screen.getByRole('option', { name: '2 environments' });
        fireEvent.click(option2);

        environmentInputs = screen.getAllByLabelText(/environment \d+ name/i);
        expect(environmentInputs).toHaveLength(2);

        const checkbox = screen.getByRole('checkbox', {
            name: /i understand adding environments leads to extra costs/i,
        });
        fireEvent.click(checkbox);

        const submitButton = screen.getByRole('button', { name: /order/i });
        fireEvent.click(submitButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith([
            { name: 'Dev', type: 'development' },
            { name: 'Staging', type: 'development' },
        ]);
    });

    test('should allow for changing environment types', () => {
        const onSubmitMock = vi.fn();
        renderComponent({ onSubmit: onSubmitMock });

        const selectButton = screen.getByRole('combobox', {
            name: /select the number of additional environments/i,
        });
        fireEvent.mouseDown(selectButton);
        const option3 = screen.getByRole('option', { name: '2 environments' });
        fireEvent.click(option3);

        const checkbox = screen.getByRole('checkbox', {
            name: /i understand adding environments leads to extra costs/i,
        });
        fireEvent.click(checkbox);

        const environmentInputs =
            screen.getAllByLabelText(/environment \d+ name/i);
        fireEvent.change(environmentInputs[0], { target: { value: 'Test' } });
        fireEvent.change(environmentInputs[1], {
            target: { value: 'Staging' },
        });

        const typeSelects = screen.getAllByRole('combobox', {
            name: /type of environment/i,
        });

        fireEvent.mouseDown(typeSelects[0]);
        const optionTesting = screen.getByRole('option', {
            name: /testing/i,
        });
        fireEvent.click(optionTesting);

        fireEvent.mouseDown(typeSelects[1]);
        const optionProduction = screen.getByRole('option', {
            name: /pre\-production/i,
        });
        fireEvent.click(optionProduction);

        const submitButton = screen.getByRole('button', { name: /order/i });
        fireEvent.click(submitButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith([
            { name: 'Test', type: 'testing' },
            { name: 'Staging', type: 'pre-production' },
        ]);
    });
});

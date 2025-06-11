import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FeatureTypeForm } from './FeatureTypeForm.tsx';

const mockFeatureType = {
    id: '1',
    name: 'Test',
    description: 'Test',
    lifetimeDays: 1,
};

describe('FeatureTypeForm', () => {
    it('should render component', () => {
        render(
            <FeatureTypeForm featureType={mockFeatureType} loading={false} />,
        );
        expect(screen.getByText('Edit flag type: Test')).toBeInTheDocument();
        expect(screen.getByText('Expected lifetime')).toBeInTheDocument();
    });

    it('should render 404 if feature type is not found', () => {
        render(<FeatureTypeForm featureType={undefined} loading={false} />);
        expect(screen.getByTestId('404_NOT_FOUND')).toBeInTheDocument();
    });

    it('should not enable inputs and submit button when loading', () => {
        render(
            <FeatureTypeForm featureType={mockFeatureType} loading={true} />,
        );
        expect(screen.getByLabelText('Expected lifetime')).toBeDisabled();
        expect(screen.getByLabelText("doesn't expire")).toBeDisabled();
        expect(screen.getByText('Save feature flag type')).toHaveAttribute(
            'aria-disabled',
            'true',
        );
    });

    it('should check "doesn\'t expire" when lifetime is 0', () => {
        render(
            <FeatureTypeForm
                featureType={{
                    ...mockFeatureType,
                    lifetimeDays: 0,
                }}
                loading={false}
            />,
        );
        const doesntExpire = screen.getByLabelText("doesn't expire");
        expect(doesntExpire).toBeChecked();
        expect(screen.getByLabelText('Expected lifetime')).toBeDisabled();
    });

    it('should disable lifetime input when "doesn\'t expire" is checked', () => {
        render(
            <FeatureTypeForm featureType={mockFeatureType} loading={false} />,
        );
        const doesntExpire = screen.getByLabelText("doesn't expire");
        const lifetime = screen.getByLabelText('Expected lifetime');
        expect(lifetime).toBeEnabled();
        doesntExpire.click();
        expect(lifetime).toBeDisabled();
    });

    it('restores lifetime input when "doesn\'t expire" is unchecked', () => {
        render(
            <FeatureTypeForm
                featureType={{
                    ...mockFeatureType,
                    lifetimeDays: 7,
                }}
                loading={false}
            />,
        );
        const doesntExpire = screen.getByLabelText("doesn't expire");
        const lifetime = screen.getByLabelText('Expected lifetime');
        doesntExpire.click();
        expect(lifetime).toBeDisabled();
        doesntExpire.click();
        expect(lifetime).toBeEnabled();
        expect(lifetime).toHaveValue(7);
    });

    it('should disable submit button when form is invalid', () => {
        render(
            <FeatureTypeForm
                featureType={{
                    ...mockFeatureType,
                    lifetimeDays: -6,
                }}
                loading={false}
            />,
        );
        expect(screen.getByText('Save feature flag type')).toHaveAttribute(
            'aria-disabled',
            'true',
        );
    });
});

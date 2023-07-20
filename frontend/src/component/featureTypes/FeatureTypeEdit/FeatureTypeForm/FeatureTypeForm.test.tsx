import { render } from 'utils/testRenderer';
import { FeatureTypeForm } from './FeatureTypeForm';
import { getByLabelText } from '@testing-library/react';

describe('FeatureTypeForm', () => {
    it('should render component', () => {
        const { getByText } = render(
            <FeatureTypeForm
                featureType={{
                    id: '1',
                    name: 'Test',
                    description: 'Test',
                    lifetimeDays: 1,
                }}
                loading={false}
            />
        );
        expect(getByText('Edit toggle type: Test')).toBeInTheDocument();
        expect(getByText('Expected lifetime')).toBeInTheDocument();
    });

    it('should render 404 if feature type is not found', () => {
        const { getByTestId } = render(
            <FeatureTypeForm featureType={undefined} loading={false} />
        );
        expect(getByTestId('404_NOT_FOUND')).toBeInTheDocument();
    });

    it('should not enable inputs and submit button when loading', () => {
        const { getByText, getByLabelText } = render(
            <FeatureTypeForm
                featureType={{
                    id: '1',
                    name: 'Test',
                    description: 'Test',
                    lifetimeDays: 1,
                }}
                loading={true}
            />
        );
        expect(getByLabelText('Expected lifetime')).toBeDisabled();
        expect(getByLabelText("doesn't expire")).toBeDisabled();
        expect(getByText('Save feature toggle type')).toBeDisabled();
    });

    it('should disable lifetime input when "doesn\'t expire" is checked', () => {
        const { getByLabelText } = render(
            <FeatureTypeForm
                featureType={{
                    id: '1',
                    name: 'Test',
                    description: 'Test',
                    lifetimeDays: 1,
                }}
                loading={false}
            />
        );
        const doesntExpire = getByLabelText("doesn't expire");
        const lifetime = getByLabelText('Expected lifetime');
        expect(lifetime).toBeEnabled();
        doesntExpire.click();
        expect(lifetime).toBeDisabled();
    });

    it('should check "doesn\'t expire" when lifetime is 0', () => {
        const { getByLabelText } = render(
            <FeatureTypeForm
                featureType={{
                    id: '1',
                    name: 'Test',
                    description: 'Test',
                    lifetimeDays: 0,
                }}
                loading={false}
            />
        );
        const doesntExpire = getByLabelText("doesn't expire");
        expect(doesntExpire).toBeChecked();
        expect(getByLabelText('Expected lifetime')).toBeDisabled();
    });
});

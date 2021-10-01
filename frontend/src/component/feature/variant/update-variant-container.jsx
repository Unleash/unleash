import { connect } from 'react-redux';

import { requestUpdateFeatureToggleVariants } from '../../../store/feature-toggle/actions';
import UpdateFeatureToggleComponent from './update-variant-component';
import { updateWeight } from '../../common/util';

const mapStateToProps = (state, ownProps) => ({
    variants: ownProps.featureToggle.variants || [],
    features: state.features.toJS(),
    stickinessOptions: [
        'default',
        ...state.context.filter(c => c.stickiness).map(c => c.name),
    ],
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addVariant: variant => {
        const { featureToggle } = ownProps;
        const currentVariants = featureToggle.variants || [];
        let stickiness;
        if (currentVariants.length > 0) {
            stickiness = currentVariants[0].stickiness || 'default';
        } else {
            stickiness = 'default';
        }
        variant.stickiness = stickiness;

        const variants = [...currentVariants, variant];
        updateWeight(variants, 1000);
        return requestUpdateFeatureToggleVariants(
            featureToggle,
            variants
        )(dispatch);
    },
    removeVariant: index => {
        const { featureToggle } = ownProps;
        const currentVariants = featureToggle.variants || [];

        const variants = currentVariants.filter((v, i) => i !== index);
        if (variants.length > 0) {
            updateWeight(variants, 1000);
        }
        requestUpdateFeatureToggleVariants(featureToggle, variants)(dispatch);
    },
    updateVariant: (index, variant) => {
        const { featureToggle } = ownProps;
        const currentVariants = featureToggle.variants || [];
        const variants = currentVariants.map((v, i) =>
            i === index ? variant : v
        );
        updateWeight(variants, 1000);
        requestUpdateFeatureToggleVariants(featureToggle, variants)(dispatch);
    },
    updateStickiness: stickiness => {
        const { featureToggle } = ownProps;
        const currentVariants = featureToggle.variants || [];
        const variants = currentVariants.map(v => ({ ...v, stickiness }));
        requestUpdateFeatureToggleVariants(featureToggle, variants)(dispatch);
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UpdateFeatureToggleComponent);

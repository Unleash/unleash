import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormButtons } from '../../common';
import VariantViewComponent from './variant-view-component';
import VariantEditComponent from './variant-edit-component';
import styles from './variant.scss';
import { UPDATE_FEATURE } from '../../../permissions';

class UpdateVariantComponent extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        // TODO unwind this stuff
        if (this.props.initCallRequired === true) {
            this.props.init(this.props.input);
        }
    }

    updateWeight(newWeight, newSize) {
        const variants = this.props.input.variants || [];
        variants.forEach((v, i) => {
            v.weight = newWeight;
            this.props.updateVariant(i, v);
        });

        // Make sure the sum of weigths is 100.
        const sum = newWeight * newSize;
        if (sum !== 100) {
            const first = variants[0];
            first.weight = 100 - sum + first.weight;
            this.props.updateVariant(0, first);
        }
    }

    addVariant = (e, variants) => {
        e.preventDefault();
        const size = variants.length + 1;
        const percentage = parseInt((1 / size) * 100);
        const variant = {
            name: '',
            weight: percentage,
            edit: true,
        };

        this.updateWeight(percentage, size);
        this.props.addVariant(variant);
    };

    removeVariant = (e, index) => {
        e.preventDefault();
        const variants = this.props.input.variants;
        const size = variants.length - 1;
        const percentage = parseInt((1 / size) * 100);
        this.updateWeight(percentage, size);
        this.props.removeVariant(index);
    };

    editVariant = (e, index, v) => {
        e.preventDefault();
        if (this.props.hasPermission(UPDATE_FEATURE)) {
            v.edit = true;
            this.props.updateVariant(index, v);
        }
    };

    closeVariant = (e, index, v) => {
        e.preventDefault();
        v.edit = false;
        this.props.updateVariant(index, v);
    };

    updateVariant = (index, newVariant) => {
        this.props.updateVariant(index, newVariant);
    };

    renderVariant = (variant, index) =>
        variant.edit ? (
            <VariantEditComponent
                key={index}
                variant={variant}
                removeVariant={e => this.removeVariant(e, index)}
                closeVariant={e => this.closeVariant(e, index, variant)}
                updateVariant={this.updateVariant.bind(this, index)}
            />
        ) : (
            <VariantViewComponent
                key={index}
                variant={variant}
                editVariant={e => this.editVariant(e, index, variant)}
                removeVariant={e => this.removeVariant(e, index)}
                hasPermission={this.props.hasPermission}
            />
        );

    render() {
        const { onSubmit, onCancel, input, features } = this.props;
        const variants = input.variants || [];
        return (
            <section style={{ padding: '16px' }}>
                <p>
                    Variants is a new <i>beta feature</i> and the implementation is subject to change at any time until
                    it is made in to a permanent feature. In order to use variants you will have use a Client SDK which
                    supports variants. You should read more about variants in the&nbsp;
                    <a target="_blank" href="https://unleash.github.io/docs/beta_features">
                        user documentation
                    </a>
                    .
                </p>
                <p style={{ backgroundColor: 'rgba(255, 229, 100, 0.3)', padding: '5px' }}>
                    The sum of variants weights needs to be a constant number to guarantee consistent hashing in the
                    client implementations, this is why we will sometime allocate a few more percentages to the first
                    variant if the sum is not exactly 100. In a final version of this feature it should be possible to
                    the user to manually set the percentages for each variant.
                </p>

                {this.props.hasPermission(UPDATE_FEATURE) ? (
                    <p>
                        <a href="#add-variant" title="Add variant" onClick={e => this.addVariant(e, variants)}>
                            Add variant
                        </a>
                    </p>
                    
                ) : null}

                <form onSubmit={onSubmit(input, features)}>
                    <table className={['mdl-data-table mdl-shadow--2dp', styles.variantTable].join(' ')}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Weight</th>
                                <th className={styles.actions} />
                            </tr>
                        </thead>
                        <tbody>{variants.map(this.renderVariant)}</tbody>
                    </table>
                    <br />
                    {this.props.hasPermission(UPDATE_FEATURE) ? (
                        <FormButtons submitText={'Save'} onCancel={onCancel} />
                    ) : null}
                </form>
            </section>
        );
    }
}

UpdateVariantComponent.propTypes = {
    input: PropTypes.object,
    features: PropTypes.array,
    setValue: PropTypes.func.isRequired,
    addVariant: PropTypes.func.isRequired,
    removeVariant: PropTypes.func.isRequired,
    updateVariant: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    initCallRequired: PropTypes.bool,
    init: PropTypes.func,
    hasPermission: PropTypes.func.isRequired,
};

export default UpdateVariantComponent;

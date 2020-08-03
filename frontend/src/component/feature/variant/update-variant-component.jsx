import React, { Component } from 'react';
import PropTypes from 'prop-types';

import VariantViewComponent from './variant-view-component';
import styles from './variant.scss';
import { UPDATE_FEATURE } from '../../../permissions';
import AddVariant from './add-variant';

const initalState = {
    showDialog: false,
    editVariant: undefined,
    editIndex: -1,
};

class UpdateVariantComponent extends Component {
    constructor(props) {
        super(props);
        this.state = { ...initalState };
    }

    closeDialog = () => {
        this.setState({ ...initalState });
    };

    openAddVariant = e => {
        e.preventDefault();
        this.setState({
            showDialog: true,
            editVariant: undefined,
            editIndex: undefined,
            title: 'Add variant',
        });
    };

    openEditVariant = (e, index, variant) => {
        e.preventDefault();
        if (this.props.hasPermission(UPDATE_FEATURE)) {
            this.setState({
                showDialog: true,
                editVariant: variant,
                editIndex: index,
                title: 'Edit variant',
            });
        }
    };

    validateName = name => {
        if (!name) {
            return { name: 'Name is required' };
        }
    };

    onRemoveVariant = (e, index) => {
        e.preventDefault();
        this.props.removeVariant(index);
    };

    renderVariant = (variant, index) => (
        <VariantViewComponent
            key={index}
            variant={variant}
            editVariant={e => this.openEditVariant(e, index, variant)}
            removeVariant={e => this.onRemoveVariant(e, index)}
            hasPermission={this.props.hasPermission}
        />
    );

    renderVariants = variants => (
        <table className={['mdl-data-table mdl-shadow--2dp', styles.variantTable].join(' ')}>
            <thead>
                <tr>
                    <th>Variant name</th>
                    <th className={styles.labels} />
                    <th>Weight</th>
                    <th>Weight Type</th>
                    <th className={styles.actions} />
                </tr>
            </thead>
            <tbody>{variants.map(this.renderVariant)}</tbody>
        </table>
    );

    render() {
        const { showDialog, editVariant, editIndex, title } = this.state;
        const { variants, addVariant, updateVariant } = this.props;
        const saveVariant = editVariant ? updateVariant.bind(null, editIndex) : addVariant;

        return (
            <section style={{ padding: '16px', maxWidth: '700px' }}>
                <p>
                    Variants allows you to return a variant object if the feature toggle is considered enabled for the
                    current request. When using variants you should use the{' '}
                    <code style={{ color: 'navy' }}>getVariant()</code> method in the Client SDK.
                </p>

                {variants.length > 0 ? this.renderVariants(variants) : <p>No variants defined.</p>}
                <br />
                {this.props.hasPermission(UPDATE_FEATURE) ? (
                    <p>
                        <a href="#add-variant" title="Add variant" onClick={this.openAddVariant}>
                            Add variant
                        </a>
                    </p>
                ) : null}
                <AddVariant
                    showDialog={showDialog}
                    closeDialog={this.closeDialog}
                    save={saveVariant}
                    validateName={this.validateName}
                    editVariant={editVariant}
                    title={title}
                />
            </section>
        );
    }
}

UpdateVariantComponent.propTypes = {
    variants: PropTypes.array.isRequired,
    addVariant: PropTypes.func.isRequired,
    removeVariant: PropTypes.func.isRequired,
    updateVariant: PropTypes.func.isRequired,
    hasPermission: PropTypes.func.isRequired,
};

export default UpdateVariantComponent;

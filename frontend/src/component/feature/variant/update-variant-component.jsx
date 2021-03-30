import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import VariantViewComponent from './variant-view-component';
import styles from './variant.module.scss';
import { UPDATE_FEATURE } from '../../../permissions';
import { Table, TableHead, TableRow, TableCell, TableBody, Button } from '@material-ui/core';
import AddVariant from './add-variant';
import MySelect from '../../common/select';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';

const initialState = {
    showDialog: false,
    editVariant: undefined,
    editIndex: -1,
};

class UpdateVariantComponent extends Component {
    constructor(props) {
        super(props);
        this.state = { ...initialState };
    }

    closeDialog = () => {
        this.setState({ ...initialState });
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
        <Table className={styles.variantTable}>
            <TableHead>
                <TableRow>
                    <TableCell>Variant name</TableCell>
                    <TableCell className={styles.labels} />
                    <TableCell>Weight</TableCell>
                    <TableCell>Weight Type</TableCell>
                    <TableCell className={styles.actions} />
                </TableRow>
            </TableHead>
            <TableBody>{variants.map(this.renderVariant)}</TableBody>
        </Table>
    );

    renderStickiness = variants => {
        const { updateStickiness, stickinessOptions } = this.props;

        if (!variants || variants.length < 2) {
            return null;
        }

        const value = variants[0].stickiness || 'default';
        const options = stickinessOptions.map(c => ({ key: c, label: c }));

        // guard on stickiness being disabled for context field.
        if (!stickinessOptions.includes(value)) {
            options.push({ key: value, label: value });
        }

        const onChange = event => updateStickiness(event.target.value);

        return (
            <section style={{ paddingTop: '16px' }}>
                <MySelect label="Stickiness" options={options} value={value} onChange={onChange} />
                &nbsp;&nbsp;
                <small
                    className={classnames(styles.paragraph, styles.helperText)}
                    style={{ display: 'block', marginTop: '0.5rem' }}
                >
                    By overriding the stickiness you can control which parameter you want to be used in order to ensure
                    consistent traffic allocation across variants.{' '}
                    <a href="https://unleash.github.io/docs/toggle_variants" target="_blank">
                        Read more
                    </a>
                </small>
            </section>
        );
    };

    render() {
        const { showDialog, editVariant, editIndex, title } = this.state;
        const { variants, addVariant, updateVariant } = this.props;
        const saveVariant = editVariant ? updateVariant.bind(null, editIndex) : addVariant;

        return (
            <section style={{ padding: '16px' }}>
                <p className={styles.paragraph}>
                    Variants allows you to return a variant object if the feature toggle is considered enabled for the
                    current request. When using variants you should use the{' '}
                    <code style={{ color: 'navy' }}>getVariant()</code> method in the Client SDK.
                </p>

                <ConditionallyRender
                    condition={variants.length > 0}
                    show={this.renderVariants(variants)}
                    elseShow={<p>No variants defined.</p>}
                />

                <br />
                <ConditionallyRender
                    condition={this.props.hasPermission(UPDATE_FEATURE)}
                    show={
                        <div>
                            <Button
                                title="Add variant"
                                onClick={this.openAddVariant}
                                variant="contained"
                                color="primary"
                                className={styles.addVariantButton}
                            >
                                Add variant
                            </Button>
                            {this.renderStickiness(variants)}
                        </div>
                    }
                />

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
    updateStickiness: PropTypes.func.isRequired,
    hasPermission: PropTypes.func.isRequired,
    stickinessOptions: PropTypes.array,
};

export default UpdateVariantComponent;

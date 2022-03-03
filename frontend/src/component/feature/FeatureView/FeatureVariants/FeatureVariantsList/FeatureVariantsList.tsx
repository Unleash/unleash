import classnames from 'classnames';
import * as jsonpatch from 'fast-json-patch';

import styles from './variants.module.scss';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core';
import AddVariant from './AddFeatureVariant/AddFeatureVariant';

import { useContext, useEffect, useState } from 'react';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { useParams } from 'react-router';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import AccessContext from '../../../../../contexts/AccessContext';
import FeatureVariantListItem from './FeatureVariantsListItem/FeatureVariantsListItem';
import { UPDATE_FEATURE_VARIANTS } from '../../../../providers/AccessProvider/permissions';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import useUnleashContext from '../../../../../hooks/api/getters/useUnleashContext/useUnleashContext';
import GeneralSelect from '../../../../common/GeneralSelect/GeneralSelect';
import { IFeatureVariant } from '../../../../../interfaces/featureToggle';
import useFeatureApi from '../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from '../../../../../hooks/useToast';
import { updateWeight } from '../../../../common/util';
import cloneDeep from 'lodash.clonedeep';
import useDeleteVariantMarkup from './FeatureVariantsListItem/useDeleteVariantMarkup';
import PermissionButton from '../../../../common/PermissionButton/PermissionButton';
import { mutate } from 'swr';
import { formatUnknownError } from '../../../../../utils/format-unknown-error';

const FeatureOverviewVariants = () => {
    const { hasAccess } = useContext(AccessContext);
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature, FEATURE_CACHE_KEY } = useFeature(projectId, featureId);
    const [variants, setVariants] = useState<IFeatureVariant[]>([]);
    const [editing, setEditing] = useState(false);
    const { context } = useUnleashContext();
    const { setToastData, setToastApiError } = useToast();
    const { patchFeatureVariants } = useFeatureApi();
    const [editVariant, setEditVariant] = useState({});
    const [showAddVariant, setShowAddVariant] = useState(false);
    const [stickinessOptions, setStickinessOptions] = useState([]);
    const [delDialog, setDelDialog] = useState({ name: '', show: false });

    useEffect(() => {
        if (feature) {
            setClonedVariants(feature.variants);
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [feature.variants]);

    useEffect(() => {
        const options = [
            'default',
            // @ts-expect-error
            ...context.filter(c => c.stickiness).map(c => c.name),
        ];

        // @ts-expect-error
        setStickinessOptions(options);
    }, [context]);

    const editable = hasAccess(UPDATE_FEATURE_VARIANTS, projectId);

    // @ts-expect-error
    const setClonedVariants = clonedVariants =>
        setVariants(cloneDeep(clonedVariants));

    const handleCloseAddVariant = () => {
        setShowAddVariant(false);
        setEditing(false);
        setEditVariant({});
    };

    const renderVariants = () => {
        return variants.map(variant => {
            return (
                <FeatureVariantListItem
                    key={variant.name}
                    variant={variant}
                    editVariant={(name: string) => {
                        const v = { ...variants.find(v => v.name === name) };
                        setEditVariant(v);
                        setEditing(true);
                        setShowAddVariant(true);
                    }}
                    setDelDialog={setDelDialog}
                    editable={editable}
                />
            );
        });
    };

    const renderStickiness = () => {
        if (!variants || variants.length < 2) {
            return null;
        }

        const value = variants[0].stickiness || 'default';
        const options = stickinessOptions.map(c => ({ key: c, label: c }));

        // guard on stickiness being disabled for context field.
        // @ts-expect-error
        if (!stickinessOptions.includes(value)) {
            // @ts-expect-error
            options.push({ key: value, label: value });
        }

        // @ts-expect-error
        const onChange = event => {
            updateStickiness(event.target.value);
        };

        return (
            <section style={{ paddingTop: '16px' }}>
                {/* @ts-expect-error */}
                <GeneralSelect
                    label="Stickiness"
                    options={options}
                    value={value}
                    onChange={onChange}
                />
                &nbsp;&nbsp;
                <small
                    className={classnames(styles.paragraph, styles.helperText)}
                    style={{ display: 'block', marginTop: '0.5rem' }}
                >
                    By overriding the stickiness you can control which parameter
                    is used to ensure consistent traffic allocation across
                    variants.{' '}
                    <a
                        href="https://docs.getunleash.io/advanced/toggle_variants"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Read more
                    </a>
                </small>
            </section>
        );
    };

    const updateStickiness = async (stickiness: string) => {
        const newVariants = [...variants].map(variant => {
            return { ...variant, stickiness };
        });

        const patch = createPatch(newVariants);

        if (patch.length === 0) return;

        try {
            const res = await patchFeatureVariants(projectId, featureId, patch);
            const { variants } = await res.json();
            mutate(FEATURE_CACHE_KEY, { ...feature, variants }, false);
            setToastData({
                title: 'Updated variant',
                confetti: true,
                type: 'success',
                text: 'Successfully updated variant stickiness',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const removeVariant = async (name: string) => {
        let updatedVariants = variants.filter(v => v.name !== name);
        try {
            await updateVariants(
                updatedVariants,
                'Successfully removed variant'
            );
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };
    const updateVariant = async (variant: IFeatureVariant) => {
        const updatedVariants = cloneDeep(variants);
        const variantIdxToUpdate = updatedVariants.findIndex(
            (v: IFeatureVariant) => v.name === variant.name
        );
        updatedVariants[variantIdxToUpdate] = variant;
        await updateVariants(updatedVariants, 'Successfully updated variant');
    };

    const saveNewVariant = async (variant: IFeatureVariant) => {
        let stickiness = 'default';
        if (variants?.length > 0) {
            stickiness = variants[0].stickiness || 'default';
        }
        variant.stickiness = stickiness;

        await updateVariants(
            [...variants, variant],
            'Successfully added a variant'
        );
    };

    const updateVariants = async (
        variants: IFeatureVariant[],
        successText: string
    ) => {
        const newVariants = updateWeight(variants, 1000);
        const patch = createPatch(newVariants);

        if (patch.length === 0) return;
        try {
            const res = await patchFeatureVariants(projectId, featureId, patch);
            const { variants } = await res.json();
            mutate(FEATURE_CACHE_KEY, { ...feature, variants }, false);
            setToastData({
                title: 'Updated variant',
                type: 'success',
                text: successText,
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const validateName = (name: string) => {
        if (!name) {
            return { name: 'Name is required' };
        }
    };

    const validateWeight = (weight: string) => {
        const weightValue = parseInt(weight);
        if (weightValue > 100 || weightValue < 0) {
            return { weight: 'weight must be between 0 and 100' };
        }
    };

    const delDialogueMarkup = useDeleteVariantMarkup({
        show: delDialog.show,
        onClick: () => {
            removeVariant(delDialog.name);
            setDelDialog({ name: '', show: false });
            setToastData({
                title: 'Deleted variant',
                type: 'success',
                text: `Successfully deleted variant`,
            });
        },
        onClose: () => setDelDialog({ show: false, name: '' }),
    });

    const createPatch = (newVariants: IFeatureVariant[]) => {
        return jsonpatch.compare(feature.variants, newVariants);
    };

    return (
        <section style={{ padding: '16px' }}>
            <Typography variant="body1">
                Variants allows you to return a variant object if the feature
                toggle is considered enabled for the current request. When using
                variants you should use the{' '}
                <code style={{ color: 'navy' }}>getVariant()</code> method in
                the Client SDK.
            </Typography>

            <ConditionallyRender
                condition={variants?.length > 0}
                show={
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
                        <TableBody>{renderVariants()}</TableBody>
                    </Table>
                }
                elseShow={<p>No variants defined.</p>}
            />

            <br />

            <div>
                <PermissionButton
                    onClick={() => {
                        setEditing(false);
                        if (variants.length === 0) {
                            setEditVariant({ weight: 1000 });
                        } else {
                            setEditVariant({ weightType: 'variable' });
                        }
                        setShowAddVariant(true);
                    }}
                    className={styles.addVariantButton}
                    data-test={'ADD_VARIANT_BUTTON'}
                    permission={UPDATE_FEATURE_VARIANTS}
                    projectId={projectId}
                >
                    New variant
                </PermissionButton>
                <ConditionallyRender
                    condition={editable}
                    show={renderStickiness()}
                />
            </div>

            <AddVariant
                showDialog={showAddVariant}
                closeDialog={handleCloseAddVariant}
                save={async (variantToSave: IFeatureVariant) => {
                    if (!editing) {
                        return saveNewVariant(variantToSave);
                    } else {
                        return updateVariant(variantToSave);
                    }
                }}
                editing={editing}
                validateName={validateName}
                validateWeight={validateWeight}
                // @ts-expect-error
                editVariant={editVariant}
                title={editing ? 'Edit variant' : 'Add variant'}
            />

            {delDialogueMarkup}
        </section>
    );
};

export default FeatureOverviewVariants;

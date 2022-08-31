import * as jsonpatch from 'fast-json-patch';

import {
    Alert,
    Table,
    TableBody,
    TableCell,
    TableRow,
    useMediaQuery,
} from '@mui/material';
import { AddVariant } from './AddFeatureVariant/AddFeatureVariant';
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import AccessContext from 'contexts/AccessContext';
import { UPDATE_FEATURE_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { IFeatureVariant } from 'interfaces/featureToggle';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { calculateVariantWeight, updateWeight } from 'component/common/util';
import cloneDeep from 'lodash.clonedeep';
import useDeleteVariantMarkup from './useDeleteVariantMarkup';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { SortableTableHeader, TablePlaceholder } from 'component/common/Table';
import { sortTypes } from 'utils/sortTypes';
import { PayloadOverridesCell } from './PayloadOverridesCell/PayloadOverridesCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { VariantsActionCell } from './VariantsActionsCell/VariantsActionsCell';

export const FeatureVariantsList = () => {
    const { hasAccess } = useContext(AccessContext);
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature, loading } = useFeature(
        projectId,
        featureId
    );
    const [variants, setVariants] = useState<IFeatureVariant[]>([]);
    const [editing, setEditing] = useState(false);
    const { context } = useUnleashContext();
    const { setToastData, setToastApiError } = useToast();
    const { patchFeatureVariants } = useFeatureApi();
    const [variantToEdit, setVariantToEdit] = useState({});
    const [showAddVariant, setShowAddVariant] = useState(false);
    const [stickinessOptions, setStickinessOptions] = useState<string[]>([]);
    const [delDialog, setDelDialog] = useState({ name: '', show: false });

    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down('lg'));

    useEffect(() => {
        if (feature) {
            setClonedVariants(feature.variants);
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [feature.variants]);

    useEffect(() => {
        const options = [
            'default',
            ...context.filter(c => c.stickiness).map(c => c.name),
        ];

        setStickinessOptions(options);
    }, [context]);

    const editable = hasAccess(UPDATE_FEATURE_VARIANTS, projectId);

    const data = useMemo(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Context name',
                description: 'Context description when loading',
            });
        }

        return feature.variants;
    }, [feature.variants, loading]);

    const editVariant = useCallback(
        (name: string) => {
            const variant = {
                ...variants.find(variant => variant.name === name),
            };
            setVariantToEdit(variant);
            setEditing(true);
            setShowAddVariant(true);
        },
        [variants, setVariantToEdit, setEditing, setShowAddVariant]
    );

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                width: '25%',
                Cell: ({
                    row: {
                        original: { name },
                    },
                }: any) => {
                    return <TextCell data-loading>{name}</TextCell>;
                },
                sortType: 'alphanumeric',
            },
            {
                Header: 'Payload/Overrides',
                accessor: 'data',
                Cell: ({
                    row: {
                        original: { overrides, payload },
                    },
                }: any) => {
                    return (
                        <PayloadOverridesCell
                            overrides={overrides}
                            payload={payload}
                        />
                    );
                },
                disableSortBy: true,
            },
            {
                Header: 'Weight',
                accessor: 'weight',
                width: '20%',
                Cell: ({
                    row: {
                        original: { name, weight },
                    },
                }: any) => {
                    return (
                        <TextCell data-testid={`VARIANT_WEIGHT_${name}`}>
                            {calculateVariantWeight(weight)} %
                        </TextCell>
                    );
                },
                sortType: 'number',
            },
            {
                Header: 'Type',
                accessor: 'weightType',
                width: '20%',
                Cell: ({
                    row: {
                        original: { weightType },
                    },
                }: any) => {
                    return <TextCell>{weightType}</TextCell>;
                },
                sortType: 'alphanumeric',
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'right',
                Cell: ({ row: { original } }: any) => (
                    <VariantsActionCell
                        editVariant={editVariant}
                        setDelDialog={setDelDialog}
                        variant={original as IFeatureVariant}
                        projectId={projectId}
                    />
                ),
                width: 150,
                disableSortBy: true,
            },
        ],
        [projectId, editVariant]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[],
            data: data as any[],
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    useEffect(() => {
        const hiddenColumns = [];
        if (isLargeScreen) {
            hiddenColumns.push('weightType');
        }
        if (isMediumScreen) {
            hiddenColumns.push('data');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isMediumScreen, isLargeScreen]);

    // @ts-expect-error
    const setClonedVariants = clonedVariants =>
        setVariants(cloneDeep(clonedVariants));

    const handleCloseAddVariant = () => {
        setShowAddVariant(false);
        setEditing(false);
        setVariantToEdit({});
    };

    const renderStickiness = () => {
        if (!variants || variants.length < 2) {
            return null;
        }

        const value = variants[0].stickiness || 'default';
        const options = stickinessOptions.map(c => ({ key: c, label: c }));

        // guard on stickiness being disabled for context field.
        if (!stickinessOptions.includes(value)) {
            options.push({ key: value, label: value });
        }

        const onChange = (value: string) => {
            updateStickiness(value).catch(console.warn);
        };

        return (
            <section style={{ paddingTop: '16px' }}>
                <GeneralSelect
                    label="Stickiness"
                    options={options}
                    value={value}
                    onChange={onChange}
                />
                &nbsp;&nbsp;
                <small style={{ display: 'block', marginTop: '0.5rem' }}>
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
            await patchFeatureVariants(projectId, featureId, patch);
            refetchFeature();
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
        let updatedVariants = variants.filter(value => value.name !== name);
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
            await patchFeatureVariants(projectId, featureId, patch);
            refetchFeature();
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

    const addVariant = () => {
        setEditing(false);
        if (variants.length === 0) {
            setVariantToEdit({ weight: 1000 });
        } else {
            setVariantToEdit({
                weightType: 'variable',
            });
        }
        setShowAddVariant(true);
    };

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Variants (${rows.length})`}
                    actions={
                        <>
                            <PermissionButton
                                onClick={addVariant}
                                data-testid={'ADD_VARIANT_BUTTON'}
                                permission={UPDATE_FEATURE_VARIANTS}
                                projectId={projectId}
                            >
                                New variant
                            </PermissionButton>
                        </>
                    }
                />
            }
        >
            <Alert severity="info" sx={{ marginBottom: '1rem' }}>
                Variants allows you to return a variant object if the feature
                toggle is considered enabled for the current request. When using
                variants you should use the{' '}
                <code style={{ fontWeight: 'bold' }}>getVariant()</code> method
                in the Client SDK.
            </Alert>
            <Table {...getTableProps()}>
                <SortableTableHeader headerGroups={headerGroups} />
                <TableBody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <TableRow
                                hover
                                {...row.getRowProps()}
                                style={{ height: '75px' }}
                            >
                                {row.cells.map(cell => (
                                    <TableCell
                                        {...cell.getCellProps()}
                                        padding="none"
                                    >
                                        {cell.render('Cell')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <TablePlaceholder>
                        No variants available. Get started by adding one.
                    </TablePlaceholder>
                }
            />

            <br />

            <div>
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
                editVariant={variantToEdit}
                title={editing ? 'Edit variant' : 'Add variant'}
            />

            {delDialogueMarkup}
        </PageContent>
    );
};

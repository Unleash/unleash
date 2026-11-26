import React, { type ReactNode, Suspense, useId, useState } from 'react';
import { Alert, Button, styled, Tab, Tabs, Typography } from '@mui/material';
import { tabClasses } from '@mui/material/Tab';
import { useNavigate } from 'react-router';
import { dequal } from 'dequal';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { formatFeaturePath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { usePayloadSchemaApi } from 'hooks/api/actions/usePayloadSchemaApi/usePayloadSchemaApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import {
    type InferredPayloadSchemaState,
    useInferredPayloadSchema,
} from 'hooks/api/getters/useInferredPayloadSchema/useInferredPayloadSchema';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useToast from 'hooks/useToast';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { formatUnknownError } from 'utils/formatUnknownError';
import { parseJsonObject } from 'utils/plainObject';
import { PayloadSchemaPane } from './PayloadSchemaPane';
import { PayloadSchemaTemplateList } from './PayloadSchemaTemplateList';
import type { PayloadSchemaTemplate } from './payloadSchemaTemplates';
import { PayloadSchemaVariantExamples } from './PayloadSchemaVariantExamples.tsx';
import { usePayloadSchemaForm } from './usePayloadSchemaForm.ts';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const LazyPayloadSchemaPreview = React.lazy(() =>
    import('./PayloadSchemaPreview.tsx').then((module) => ({
        default: module.PayloadSchemaPreview,
    })),
);

const StyledSchemaSourceRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const Pill = styled(Tab)(({ theme }) => ({
    minHeight: 0,
    minWidth: 0,
    height: theme.spacing(4),
    padding: theme.spacing(0, 1.75),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    background: theme.palette.background.paper,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
    },
    [`&.${tabClasses.selected}`]: {
        borderColor: theme.palette.primary.containerBorder,
        background: theme.palette.primary.container,
        color: theme.palette.primary.onContainer,
    },
}));

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

const StyledSplit = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    gap: theme.spacing(2.5),
    flex: 1,
    [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
    },
}));

type SchemaSource = 'examples' | 'template' | 'import';

type Drafts = {
    template?: PayloadSchemaTemplate;
    import?: string;
};

type ActiveSource = { source: SchemaSource; drafts: Drafts };

const paneTitles: Record<SchemaSource, string> = {
    examples: 'JSON values your app already uses',
    template: 'Choose a template',
    import: 'Import JSON Schema',
};

interface IPayloadSchemaFormProps {
    projectId: string;
    featureId: string;
    feature: IFeatureToggle;
    refetchFeature: () => void;
    inferred?: InferredPayloadSchemaState;
}

const PayloadSchemaForm = ({
    projectId,
    featureId,
    feature,
    refetchFeature,
    inferred,
}: IPayloadSchemaFormProps) => {
    const { upsertPayloadSchema } = usePayloadSchemaApi({
        project: projectId,
        feature: featureId,
    });
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const staged = usePayloadSchemaForm(feature.payloadSchema);
    const isCreateMode = inferred !== undefined;
    const [selection, setSelection] = useState<
        ActiveSource | { source: false }
    >(isCreateMode ? { source: 'examples', drafts: {} } : { source: false });
    const sourceId = useId();
    const tabId = (source: SchemaSource) => `${sourceId}-tab-${source}`;
    const sourcePanelId = `${sourceId}-panel`;

    const draftSchemas = (
        drafts: Drafts,
    ): Record<SchemaSource, Record<string, unknown> | undefined> => ({
        examples:
            inferred?.status === 'ready' && inferred.schema.examples.length
                ? inferred.schema
                : undefined,
        template: drafts.template?.schema,
        import:
            drafts.import === undefined
                ? undefined
                : parseJsonObject(drafts.import),
    });
    const draftSchema = selection.source
        ? draftSchemas(selection.drafts)[selection.source]
        : undefined;
    const canApplyDraft =
        draftSchema !== undefined && !dequal(draftSchema, staged.parsedSchema);

    const selectSource = (source: SchemaSource) =>
        setSelection({
            source,
            drafts: selection.source ? selection.drafts : {},
        });

    const closeSource = () => setSelection({ source: false });

    const stageDraft = () => {
        staged.edit({ json: draftSchema });
        closeSource();
    };

    const closeSidebar = () =>
        navigate(formatFeaturePath(projectId, featureId));

    const saveAndClose = async () => {
        try {
            const next = await staged.save(upsertPayloadSchema);
            if (next.status === 'saved') {
                setToastData({ type: 'success', text: 'Payload schema saved' });
                refetchFeature();
                closeSidebar();
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const sourcePanes = ({
        source,
        drafts,
    }: ActiveSource): Record<SchemaSource, ReactNode> => ({
        examples: inferred ? (
            <PayloadSchemaVariantExamples inferred={inferred} />
        ) : null,
        template: (
            <PayloadSchemaTemplateList
                selectedKey={drafts.template?.key}
                onSelect={(template) =>
                    setSelection({ source, drafts: { ...drafts, template } })
                }
            />
        ),
        import: (
            <Suspense key='import' fallback={null}>
                <LazyReactJSONEditor
                    content={{ text: drafts.import ?? '' }}
                    onChange={(text) =>
                        setSelection({
                            source,
                            drafts: { ...drafts, import: text },
                        })
                    }
                    editorStyle='fill'
                />
            </Suspense>
        ),
    });

    const stagedPane = (
        <Suspense key='staged' fallback={null}>
            <LazyReactJSONEditor
                content={staged.state.content}
                validationError={
                    staged.state.status === 'rejected'
                        ? staged.state.error
                        : undefined
                }
                onChange={(text) => staged.edit({ text })}
                readOnly={!staged.editable}
                editorStyle='fill'
            />
        </Suspense>
    );

    return (
        <FormTemplate
            layout='modal'
            fitContainerHeight
            title={
                isCreateMode ? 'Create payload schema' : 'Edit payload schema'
            }
            showGuidance={false}
            description=''
            footer={
                <StyledButtons>
                    <Button onClick={closeSidebar}>Cancel</Button>
                    <PermissionButton
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                        disabled={selection.source !== false || !staged.canSave}
                        onClick={saveAndClose}
                    >
                        Save {isCreateMode ? 'schema' : 'changes'}
                    </PermissionButton>
                </StyledButtons>
            }
        >
            {isCreateMode ? (
                <>
                    <Alert severity='info' sx={{ mb: 2 }}>
                        <strong>Where you use this schema:</strong> when you add
                        a strategy to a flag, add a variant, set its payload
                        type to JSON and choose this schema. The variant's
                        payload is then checked against it.
                    </Alert>
                    <StyledSchemaSourceRow>
                        <Typography variant='body2'>Start from</Typography>
                        <Tabs
                            value={selection.source}
                            onChange={(_event, value: SchemaSource) =>
                                selectSource(value)
                            }
                            aria-label='Start from'
                            sx={{ minHeight: 0, overflow: 'visible' }}
                            slotProps={{
                                indicator: { sx: { display: 'none' } },
                                scroller: { style: { overflow: 'visible' } },
                                list: { sx: { flexWrap: 'wrap', gap: 1 } },
                            }}
                        >
                            <Pill
                                value='examples'
                                label='Examples'
                                id={tabId('examples')}
                                aria-controls={sourcePanelId}
                            />
                            <Pill
                                value='template'
                                label='Use a template'
                                id={tabId('template')}
                                aria-controls={sourcePanelId}
                            />
                            <Pill
                                value='import'
                                label='Import JSON Schema'
                                id={tabId('import')}
                                aria-controls={sourcePanelId}
                            />
                        </Tabs>
                    </StyledSchemaSourceRow>
                </>
            ) : null}

            <StyledSplit>
                <PayloadSchemaPane
                    id={sourcePanelId}
                    title={
                        selection.source
                            ? paneTitles[selection.source]
                            : 'Payload schema'
                    }
                    aside={
                        selection.source ? (
                            <>
                                {!staged.isEmpty ? (
                                    <Button size='small' onClick={closeSource}>
                                        Cancel
                                    </Button>
                                ) : null}
                                <PermissionButton
                                    permission={UPDATE_FEATURE}
                                    projectId={projectId}
                                    size='small'
                                    disabled={!canApplyDraft}
                                    onClick={stageDraft}
                                >
                                    Use these fields
                                </PermissionButton>
                            </>
                        ) : null
                    }
                >
                    {selection.source
                        ? sourcePanes(selection)[selection.source]
                        : stagedPane}
                </PayloadSchemaPane>
                <PayloadSchemaPane
                    title='Preview'
                    aside={
                        <Typography
                            variant='caption'
                            sx={{ color: 'text.secondary' }}
                        >
                            The form people fill in to add a value
                        </Typography>
                    }
                >
                    <Suspense fallback={null}>
                        <LazyPayloadSchemaPreview
                            schema={
                                selection.source
                                    ? draftSchema
                                    : staged.parsedSchema
                            }
                        />
                    </Suspense>
                </PayloadSchemaPane>
            </StyledSplit>
        </FormTemplate>
    );
};

const CreatePayloadSchemaForm = (
    props: Omit<IPayloadSchemaFormProps, 'inferred'>,
) => {
    const inferred = useInferredPayloadSchema(props.projectId, props.featureId);
    return <PayloadSchemaForm {...props} inferred={inferred} />;
};

export const PayloadSchemaSidebar = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature, loading, error } = useFeature(
        projectId,
        featureId,
    );

    if (loading || error) {
        return null;
    }

    const formProps = { projectId, featureId, feature, refetchFeature };
    return feature.payloadSchema ? (
        <PayloadSchemaForm {...formProps} />
    ) : (
        <CreatePayloadSchemaForm {...formProps} />
    );
};

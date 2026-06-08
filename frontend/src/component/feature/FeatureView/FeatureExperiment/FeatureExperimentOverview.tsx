import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
    IN,
    NOT_IN,
    STR_CONTAINS,
    STR_ENDS_WITH,
    STR_STARTS_WITH,
    type Operator,
} from 'constants/operators';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    Link as MuiLink,
    ListSubheader,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
    styled,
    useTheme,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlineOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE,
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type {
    IFeatureEnvironment,
    IFeatureToggle,
} from 'interfaces/featureToggle';
import {
    createExperimentStrategyPayload,
    createTreatmentKey,
    experimentIsValid,
    getExperimentContextFields,
    getExperimentPropertyNames,
    laneTotal,
    resolveExperimentConfig,
    resolvePreviewTreatment,
    type ExperimentEnvironmentConfig,
    type ExperimentLane,
    type ExperimentTreatment,
    type TreatmentConstraint,
} from './experimentStrategy.ts';

const Page = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const Builder = styled(Paper)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    overflow: 'hidden',
}));

const BuilderHeader = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: theme.spacing(2),
    alignItems: 'center',
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const BuilderBody = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 320px',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const EnvironmentPicker = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}));

const VariantGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: theme.spacing(2),
}));

const VariantCard = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'decorationColor',
})<{ decorationColor: string }>(({ theme, decorationColor }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderLeft: `4px solid ${decorationColor}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: 'none',
    padding: theme.spacing(2),
}));

const LaneCard = styled(Paper)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: 'none',
    padding: theme.spacing(1.5),
}));

const LaneBody = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 1.15fr) minmax(260px, 0.85fr)',
    gap: theme.spacing(2),
    alignItems: 'start',
    [theme.breakpoints.down('lg')]: {
        gridTemplateColumns: '1fr',
    },
}));

const ConstraintRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 180px) 32px',
    gap: theme.spacing(1),
    alignItems: 'center',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.elevation1,
    '& > *': { minWidth: 0 },
    '& .constraint-values': { gridColumn: '1 / 3' },
    '& .constraint-delete': {
        gridColumn: '3',
        gridRow: '1 / 3',
        alignSelf: 'center',
    },
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        '& .constraint-values, & .constraint-delete': {
            gridColumn: 'auto',
            gridRow: 'auto',
        },
    },
}));

const AllocationGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: theme.spacing(1),
}));

const PropertyGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns:
        '180px repeat(var(--treatment-count), minmax(160px, 1fr)) 40px',
    gap: theme.spacing(1),
    alignItems: 'center',
    overflowX: 'auto',
    paddingBottom: theme.spacing(1),
}));

const TreatmentHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const ColorSwatch = styled('span')<{ color: string }>(({ color }) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
    flex: '0 0 auto',
}));

const PreviewCode = styled('pre')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: theme.typography.body2.fontSize,
}));

const percentInputProps = {
    endAdornment: <InputAdornment position='end'>%</InputAdornment>,
};

const treatmentConstraintOperators: Operator[] = [
    IN,
    NOT_IN,
    STR_CONTAINS,
    STR_STARTS_WITH,
    STR_ENDS_WITH,
];

const operatorLabels: Partial<Record<Operator, string>> = {
    [IN]: 'is one of',
    [NOT_IN]: 'is not one of',
    [STR_CONTAINS]: 'contains',
    [STR_STARTS_WITH]: 'starts with',
    [STR_ENDS_WITH]: 'ends with',
};

const defaultPropertyNames = ['headline', 'buttonColor'];

const statusText = (
    config: ExperimentEnvironmentConfig,
    environmentEnabled = config.environment.enabled,
): string => {
    if (!config.configured) return 'Not configured';
    if (!environmentEnabled) return 'Environment off';
    return 'Running';
};

const createUniqueTreatmentKey = (
    label: string,
    treatments: ExperimentTreatment[],
): string => {
    const baseKey = createTreatmentKey(label);
    const existing = new Set(treatments.map((treatment) => treatment.name));
    if (!existing.has(baseKey)) return baseKey;

    let index = 2;
    while (existing.has(`${baseKey}-${index}`)) index += 1;
    return `${baseKey}-${index}`;
};

const propertyNamesAreValid = (propertyNames: string[]): boolean => {
    const normalized = propertyNames.map((name) => name.trim()).filter(Boolean);
    return (
        normalized.length === propertyNames.length &&
        new Set(normalized).size === normalized.length
    );
};

const roundOneDecimal = (value: number): number => Math.round(value * 10) / 10;

const treatmentColor = (colors: string[], index: number): string =>
    colors[index % colors.length] ?? '#6C65E5';

const parseConstraintValues = (rawValue: string): string[] =>
    rawValue
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

const formatPreviewPayload = (treatment?: ExperimentTreatment): string =>
    JSON.stringify(treatment?.properties ?? {}, null, 2);

const previewContextFields = (
    fields: string[],
    lanes: ExperimentLane[],
): string[] => {
    const stickinessFields = lanes
        .map((lane) => lane.stickiness)
        .filter((field) => field && field !== 'default' && field !== 'random');

    return Array.from(new Set([...fields, ...stickinessFields]));
};

type ContextFieldGroup = { groupHeader: string; options: string[] };

const createContextFieldGroups = (
    context: { name: string; project?: string }[],
    lanes: ExperimentLane[],
): ContextFieldGroup[] => {
    const selectedContextNames = new Set(
        lanes.flatMap((lane) =>
            lane.constraints.map((constraint) => constraint.contextName),
        ),
    );
    const existingContextNames = new Set(context.map((field) => field.name));
    const deletedContextNames = Array.from(selectedContextNames).filter(
        (name) => name && !existingContextNames.has(name),
    );
    const projectFields = context
        .filter((field) => Boolean(field.project))
        .map((field) => field.name)
        .toSorted();
    const globalFields = context
        .filter((field) => !field.project)
        .map((field) => field.name)
        .toSorted();

    return [
        projectFields.length > 0 && {
            groupHeader: 'Project context fields',
            options: projectFields,
        },
        globalFields.length > 0 && {
            groupHeader: 'Global context fields',
            options: globalFields,
        },
        deletedContextNames.length > 0 && {
            groupHeader: 'Deleted context fields',
            options: deletedContextNames.toSorted(),
        },
    ].filter(Boolean) as ContextFieldGroup[];
};

const recalculateLaneControlWeight = (
    lane: ExperimentLane,
    treatments: ExperimentTreatment[],
): ExperimentLane => {
    const controlName = treatments[0]?.name;
    if (!controlName) return lane;

    const assigned = treatments
        .slice(1)
        .reduce(
            (sum, treatment) => sum + (lane.weights[treatment.name] ?? 0),
            0,
        );

    return {
        ...lane,
        weights: {
            ...lane.weights,
            [controlName]: roundOneDecimal(100 - assigned),
        },
    };
};

const normalizeLaneWeights = (
    lane: ExperimentLane,
    treatments: ExperimentTreatment[],
): ExperimentLane => ({
    ...lane,
    weights: Object.fromEntries(
        treatments.map((treatment) => [
            treatment.name,
            lane.weights[treatment.name] ?? 0,
        ]),
    ),
});

type ExperimentEnvironmentEditorProps = {
    feature: IFeatureToggle;
    environment: IFeatureEnvironment;
    onSaved: () => void;
};

const ExperimentEnvironmentEditor = ({
    feature,
    environment,
    onSaved,
}: ExperimentEnvironmentEditorProps) => {
    const theme = useTheme();
    const colors = theme.palette.variants;
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const config = useMemo(
        () => resolveExperimentConfig(environment),
        [environment],
    );
    const [treatments, setTreatments] = useState(config.treatments);
    const [lanes, setLanes] = useState(() =>
        config.lanes.map((lane) =>
            normalizeLaneWeights(lane, config.treatments),
        ),
    );
    const [removedLaneIds, setRemovedLaneIds] = useState<string[]>([]);
    const [propertyNames, setPropertyNames] = useState(() => {
        const names = getExperimentPropertyNames(config.treatments);
        return names.length > 0 ? names : defaultPropertyNames;
    });
    const [environmentEnabled, setEnvironmentEnabled] = useState(
        environment.enabled,
    );
    const [previewContext, setPreviewContext] = useState<
        Record<string, string>
    >({});
    const [constraintValueDrafts, setConstraintValueDrafts] = useState<
        Record<string, string>
    >({});

    useEffect(() => {
        setEnvironmentEnabled(environment.enabled);
    }, [environment.enabled]);

    useEffect(() => {
        setTreatments(config.treatments);
        setLanes(
            config.lanes.map((lane) =>
                normalizeLaneWeights(lane, config.treatments),
            ),
        );
        setRemovedLaneIds([]);
        const names = getExperimentPropertyNames(config.treatments);
        setPropertyNames(names.length > 0 ? names : defaultPropertyNames);
        setConstraintValueDrafts({});
    }, [config]);

    const {
        addStrategyToFeature,
        updateStrategyOnFeature,
        deleteStrategyFromFeature,
        setStrategiesSortOrder,
        loading,
    } = useFeatureStrategyApi();
    const {
        patchFeatureToggle,
        toggleFeatureEnvironmentOn,
        toggleFeatureEnvironmentOff,
        loading: featureApiLoading,
    } = useFeatureApi();
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();
    const { context: assignableContext } =
        useAssignableUnleashContext(projectId);

    const contextFieldGroups = useMemo(
        () => createContextFieldGroups(assignableContext, lanes),
        [assignableContext, lanes],
    );
    const contextFieldOptions = contextFieldGroups.flatMap(
        (group) => group.options,
    );
    const defaultContextField = contextFieldOptions[0] ?? 'userId';
    const contextFields = previewContextFields(
        getExperimentContextFields(lanes),
        lanes,
    );
    const preview = resolvePreviewTreatment(treatments, lanes, previewContext, {
        groupId: featureId,
    });
    const previewTreatmentIndex = Math.max(
        treatments.findIndex(
            (treatment) => treatment.name === preview.treatment?.name,
        ),
        0,
    );
    const valid =
        experimentIsValid(treatments, lanes) &&
        propertyNamesAreValid(propertyNames);
    const permission = config.configured
        ? UPDATE_FEATURE_STRATEGY
        : CREATE_FEATURE_STRATEGY;

    const syncTreatmentRename = (index: number, nextName: string) => {
        const previousName = treatments[index].name;
        const name = createTreatmentKey(nextName);
        setTreatments((current) =>
            current.map((treatment, currentIndex) =>
                currentIndex === index
                    ? { ...treatment, name, label: name }
                    : treatment,
            ),
        );
        setLanes((current) =>
            current.map((lane) => {
                const { [previousName]: previousWeight, ...rest } =
                    lane.weights;
                return {
                    ...lane,
                    weights: { ...rest, [name]: previousWeight ?? 0 },
                };
            }),
        );
    };

    const addTreatment = () => {
        const nextLabel = `Variant${String.fromCharCode(65 + treatments.length)}`;
        const name = createUniqueTreatmentKey(nextLabel, treatments);
        setTreatments((current) => [
            ...current,
            {
                name,
                label: name,
                properties: Object.fromEntries(
                    propertyNames.map((propertyName) => [propertyName, '']),
                ),
            },
        ]);
        setLanes((current) =>
            current.map((lane) =>
                recalculateLaneControlWeight(
                    { ...lane, weights: { ...lane.weights, [name]: 0 } },
                    [...treatments, { name, label: name, properties: {} }],
                ),
            ),
        );
    };

    const removeTreatment = (index: number) => {
        if (treatments.length <= 2) return;
        const removedName = treatments[index].name;
        const nextTreatments = treatments.filter(
            (_, currentIndex) => currentIndex !== index,
        );
        setTreatments(nextTreatments);
        setLanes((current) =>
            current.map((lane) => {
                const { [removedName]: _removed, ...weights } = lane.weights;
                return recalculateLaneControlWeight(
                    { ...lane, weights },
                    nextTreatments,
                );
            }),
        );
    };

    const updateLane = (laneIndex: number, patch: Partial<ExperimentLane>) => {
        setLanes((current) =>
            current.map((lane, index) =>
                index === laneIndex ? { ...lane, ...patch } : lane,
            ),
        );
    };

    const updateLaneWeight = (
        laneIndex: number,
        treatmentIndex: number,
        rawValue: string,
    ) => {
        if (treatmentIndex === 0) return;
        const parsed = Number(rawValue);
        if (Number.isNaN(parsed)) return;

        setLanes((current) =>
            current.map((lane, index) => {
                if (index !== laneIndex) return lane;
                const otherAssigned = treatments
                    .slice(1)
                    .reduce(
                        (sum, treatment, currentTreatmentIndex) =>
                            currentTreatmentIndex + 1 === treatmentIndex
                                ? sum
                                : sum + (lane.weights[treatment.name] ?? 0),
                        0,
                    );
                const max = Math.max(100 - otherAssigned, 0);
                const weight = roundOneDecimal(
                    Math.min(Math.max(parsed, 0), max),
                );
                return recalculateLaneControlWeight(
                    {
                        ...lane,
                        weights: {
                            ...lane.weights,
                            [treatments[treatmentIndex].name]: weight,
                        },
                    },
                    treatments,
                );
            }),
        );
    };

    const addLane = () => {
        setLanes((current) => {
            const fallbackLane = current.at(-1);
            const newLane = {
                name: `Lane ${current.length + 1}`,
                constraints: [
                    {
                        contextName: defaultContextField,
                        operator: IN,
                        values: [],
                        inverted: false,
                    },
                ],
                segments: [],
                disabled: false,
                stickiness: fallbackLane?.stickiness ?? 'default',
                weights: fallbackLane?.weights
                    ? { ...fallbackLane.weights }
                    : {},
            };

            return current.length === 0 ? [newLane] : [newLane, ...current];
        });
    };

    const removeLane = (laneIndex: number) => {
        if (lanes.length <= 1 || laneIndex === lanes.length - 1) return;
        const lane = lanes[laneIndex];
        if (lane.id) setRemovedLaneIds((current) => [...current, lane.id!]);
        setLanes((current) =>
            current.filter((_, index) => index !== laneIndex),
        );
    };

    const updateLaneConstraint = (
        laneIndex: number,
        constraintIndex: number,
        patch: Partial<TreatmentConstraint>,
    ) => {
        setLanes((current) =>
            current.map((lane, index) =>
                index === laneIndex
                    ? {
                          ...lane,
                          constraints: lane.constraints.map(
                              (constraint, currentConstraintIndex) =>
                                  currentConstraintIndex === constraintIndex
                                      ? { ...constraint, ...patch }
                                      : constraint,
                          ),
                      }
                    : lane,
            ),
        );
    };

    const addLaneConstraint = (laneIndex: number) => {
        if (laneIndex === lanes.length - 1) return;

        setLanes((current) =>
            current.map((lane, index) =>
                index === laneIndex
                    ? {
                          ...lane,
                          constraints: [
                              ...lane.constraints,
                              {
                                  contextName: defaultContextField,
                                  operator: IN,
                                  values: [],
                                  inverted: false,
                              },
                          ],
                      }
                    : lane,
            ),
        );
    };

    const removeLaneConstraint = (
        laneIndex: number,
        constraintIndex: number,
    ) => {
        setLanes((current) =>
            current.map((lane, index) =>
                index === laneIndex
                    ? {
                          ...lane,
                          constraints: lane.constraints.filter(
                              (_, currentConstraintIndex) =>
                                  currentConstraintIndex !== constraintIndex,
                          ),
                      }
                    : lane,
            ),
        );
    };

    const constraintDraftKey = (
        laneIndex: number,
        constraintIndex: number,
    ): string => `${laneIndex}:${constraintIndex}`;

    const addConstraintValues = (
        laneIndex: number,
        constraintIndex: number,
        rawValue: string,
    ) => {
        const nextValues = parseConstraintValues(rawValue);
        if (nextValues.length === 0) return;
        const constraint = lanes[laneIndex]?.constraints[constraintIndex];
        const values = Array.from(
            new Set([...(constraint?.values ?? []), ...nextValues]),
        );
        updateLaneConstraint(laneIndex, constraintIndex, { values });
        setConstraintValueDrafts((current) => ({
            ...current,
            [constraintDraftKey(laneIndex, constraintIndex)]: '',
        }));
    };

    const removeConstraintValue = (
        laneIndex: number,
        constraintIndex: number,
        value: string,
    ) => {
        const constraint = lanes[laneIndex]?.constraints[constraintIndex];
        updateLaneConstraint(laneIndex, constraintIndex, {
            values: (constraint?.values ?? []).filter(
                (currentValue) => currentValue !== value,
            ),
        });
    };

    const updateTreatmentProperty = (
        treatmentIndex: number,
        propertyName: string,
        value: string,
    ) => {
        setTreatments((current) =>
            current.map((treatment, index) =>
                index === treatmentIndex
                    ? {
                          ...treatment,
                          properties: {
                              ...treatment.properties,
                              [propertyName]: value,
                          },
                      }
                    : treatment,
            ),
        );
    };

    const renameProperty = (index: number, nextName: string) => {
        const previousName = propertyNames[index];
        setPropertyNames((current) =>
            current.map((name, i) => (i === index ? nextName : name)),
        );
        setTreatments((current) =>
            current.map((treatment) => {
                const { [previousName]: value, ...rest } = treatment.properties;
                return {
                    ...treatment,
                    properties: nextName
                        ? { ...rest, [nextName]: value ?? '' }
                        : rest,
                };
            }),
        );
    };

    const removeProperty = (propertyName: string) => {
        setPropertyNames((current) =>
            current.filter((name) => name !== propertyName),
        );
        setTreatments((current) =>
            current.map((treatment) => {
                const { [propertyName]: _removed, ...properties } =
                    treatment.properties;
                return { ...treatment, properties };
            }),
        );
    };

    const addProperty = () => {
        let index = propertyNames.length + 1;
        let name = `property${index}`;
        while (propertyNames.includes(name)) {
            index += 1;
            name = `property${index}`;
        }
        setPropertyNames((current) => [...current, name]);
        setTreatments((current) =>
            current.map((treatment) => ({
                ...treatment,
                properties: { ...treatment.properties, [name]: '' },
            })),
        );
    };

    const resetExperiment = () => {
        setTreatments(config.treatments);
        setLanes(
            config.lanes.map((lane) =>
                normalizeLaneWeights(lane, config.treatments),
            ),
        );
        setRemovedLaneIds([]);
        const names = getExperimentPropertyNames(config.treatments);
        setPropertyNames(names.length > 0 ? names : defaultPropertyNames);
        setPreviewContext({});
        setConstraintValueDrafts({});
    };

    const toggleEnvironment = async () => {
        try {
            if (environmentEnabled) {
                await toggleFeatureEnvironmentOff(
                    projectId,
                    featureId,
                    environment.name,
                );
                setEnvironmentEnabled(false);
                setToastData({ type: 'success', text: 'Environment disabled' });
            } else {
                await toggleFeatureEnvironmentOn(
                    projectId,
                    featureId,
                    environment.name,
                    true,
                );
                setEnvironmentEnabled(true);
                setToastData({ type: 'success', text: 'Environment enabled' });
            }
            onSaved();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const enableImpressionData = async () => {
        try {
            await patchFeatureToggle(projectId, featureId, [
                { op: 'replace', path: '/impressionData', value: true },
            ]);
            setToastData({ type: 'success', text: 'Impression data enabled' });
            onSaved();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onSave = async () => {
        const lanesForSave = lanes.map((lane, index) =>
            index === lanes.length - 1
                ? { ...lane, name: 'Fallback', constraints: [] }
                : lane,
        );
        const changes = lanesForSave.map((lane, sortOrder) => {
            const payload = createExperimentStrategyPayload({
                featureId,
                lane,
                treatments,
                sortOrder,
            });
            return {
                lane,
                payload,
                changeRequestPayload: lane.id
                    ? { ...payload, id: lane.id }
                    : payload,
                action: lane.id
                    ? ('updateStrategy' as const)
                    : ('addStrategy' as const),
            };
        });

        try {
            if (isChangeRequestConfigured(environment.name)) {
                await addChange(projectId, environment.name, [
                    ...changes.map(({ action, changeRequestPayload }) => ({
                        action,
                        feature: featureId,
                        payload: changeRequestPayload,
                    })),
                    ...removedLaneIds.map((id) => ({
                        action: 'deleteStrategy' as const,
                        feature: featureId,
                        payload: { id },
                    })),
                    {
                        action: 'reorderStrategy' as const,
                        feature: featureId,
                        payload: lanesForSave
                            .filter((lane) => Boolean(lane.id))
                            .map((lane, sortOrder) => ({
                                id: lane.id!,
                                sortOrder,
                            })),
                    },
                ]);
                refetchChangeRequests();
                setToastData({
                    type: 'success',
                    text: 'Experiment changes added to draft',
                });
            } else {
                const savedLanes = await Promise.all(
                    changes.map(async ({ lane, payload }) => {
                        if (lane.id) {
                            await updateStrategyOnFeature(
                                projectId,
                                featureId,
                                environment.name,
                                lane.id,
                                payload,
                            );
                            return lane;
                        }

                        const strategy = await addStrategyToFeature(
                            projectId,
                            featureId,
                            environment.name,
                            payload,
                        );

                        return { ...lane, id: strategy.id };
                    }),
                );
                await Promise.all(
                    removedLaneIds.map((id) =>
                        deleteStrategyFromFeature(
                            projectId,
                            featureId,
                            environment.name,
                            id,
                        ),
                    ),
                );
                await setStrategiesSortOrder(
                    projectId,
                    featureId,
                    environment.name,
                    savedLanes.map((lane, sortOrder) => ({
                        id: lane.id!,
                        sortOrder,
                    })),
                );
                setLanes(savedLanes);
                setRemovedLaneIds([]);
                setToastData({ type: 'success', text: 'Experiment updated' });
            }
            onSaved();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const renderConstraint = (
        lane: ExperimentLane,
        laneIndex: number,
        constraint: TreatmentConstraint,
        constraintIndex: number,
    ) => (
        <ConstraintRow key={`${laneIndex}-${constraintIndex}`}>
            <TextField
                select
                label='Context'
                value={constraint.contextName}
                onChange={(event) =>
                    updateLaneConstraint(laneIndex, constraintIndex, {
                        contextName: event.target.value,
                    })
                }
                size='small'
            >
                {contextFieldGroups.map((group) => [
                    <ListSubheader key={`${group.groupHeader}-header`}>
                        {group.groupHeader}
                    </ListSubheader>,
                    ...group.options.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    )),
                ])}
            </TextField>
            <TextField
                select
                label='Operator'
                value={constraint.operator}
                onChange={(event) =>
                    updateLaneConstraint(laneIndex, constraintIndex, {
                        operator: event.target.value as Operator,
                    })
                }
                size='small'
            >
                {treatmentConstraintOperators.map((operator) => (
                    <MenuItem key={operator} value={operator}>
                        {operatorLabels[operator]}
                    </MenuItem>
                ))}
            </TextField>
            <Box className='constraint-values'>
                {(constraint.values?.length ?? 0) > 0 ? (
                    <Stack
                        direction='row'
                        spacing={0.5}
                        sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}
                    >
                        {constraint.values?.map((value) => (
                            <Chip
                                key={value}
                                label={value}
                                onDelete={() =>
                                    removeConstraintValue(
                                        laneIndex,
                                        constraintIndex,
                                        value,
                                    )
                                }
                                size='small'
                            />
                        ))}
                    </Stack>
                ) : null}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                        gap: 1,
                    }}
                >
                    <TextField
                        label='Value'
                        placeholder='hosted'
                        value={
                            constraintValueDrafts[
                                constraintDraftKey(laneIndex, constraintIndex)
                            ] ?? ''
                        }
                        onChange={(event) =>
                            setConstraintValueDrafts((current) => ({
                                ...current,
                                [constraintDraftKey(
                                    laneIndex,
                                    constraintIndex,
                                )]: event.target.value,
                            }))
                        }
                        onKeyDown={(event) => {
                            if (event.key !== 'Enter' && event.key !== ',')
                                return;
                            event.preventDefault();
                            addConstraintValues(
                                laneIndex,
                                constraintIndex,
                                constraintValueDrafts[
                                    constraintDraftKey(
                                        laneIndex,
                                        constraintIndex,
                                    )
                                ] ?? '',
                            );
                        }}
                        size='small'
                    />
                    <Button
                        onClick={() =>
                            addConstraintValues(
                                laneIndex,
                                constraintIndex,
                                constraintValueDrafts[
                                    constraintDraftKey(
                                        laneIndex,
                                        constraintIndex,
                                    )
                                ] ?? '',
                            )
                        }
                        size='small'
                        variant='outlined'
                    >
                        Add
                    </Button>
                </Box>
            </Box>
            <IconButton
                className='constraint-delete'
                aria-label={`Remove constraint from ${lane.name}`}
                onClick={() => removeLaneConstraint(laneIndex, constraintIndex)}
                size='small'
            >
                <Delete />
            </IconButton>
        </ConstraintRow>
    );

    return (
        <Builder>
            <BuilderHeader>
                <Box>
                    <Typography variant='h2'>{environment.name}</Typography>
                    <Stack
                        direction='row'
                        spacing={1}
                        sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}
                    >
                        <Chip
                            size='small'
                            label={statusText(config, environmentEnabled)}
                        />
                        <Chip
                            size='small'
                            label={`${lanes.length} audiences`}
                        />
                        <Chip
                            size='small'
                            label={`${treatments.length} treatments`}
                        />
                    </Stack>
                </Box>
                <PermissionButton
                    permission={UPDATE_FEATURE_ENVIRONMENT}
                    projectId={projectId}
                    environmentId={environment.name}
                    onClick={toggleEnvironment}
                    disabled={featureApiLoading}
                    variant={environmentEnabled ? 'outlined' : 'contained'}
                >
                    {environmentEnabled ? 'Stop serving' : 'Start serving'}
                </PermissionButton>
            </BuilderHeader>
            <BuilderBody>
                <Stack spacing={3}>
                    {!feature.impressionData ? (
                        <Alert
                            severity='info'
                            action={
                                <PermissionButton
                                    permission={UPDATE_FEATURE}
                                    projectId={projectId}
                                    onClick={enableImpressionData}
                                    disabled={featureApiLoading}
                                    variant='outlined'
                                    size='small'
                                >
                                    Enable
                                </PermissionButton>
                            }
                        >
                            Enable impression data to emit `getVariant` events
                            for experiment analysis.
                        </Alert>
                    ) : null}

                    {config.hasAdvancedConfiguration ? (
                        <Alert severity='warning'>
                            This environment has non-experiment strategies. This
                            view edits flexible rollout experiment audiences
                            only.
                        </Alert>
                    ) : null}

                    <Stack spacing={2}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 2,
                                alignItems: 'center',
                            }}
                        >
                            <Box>
                                <Typography variant='h3'>Treatments</Typography>
                                <TreatmentHeader>
                                    <Typography color='text.secondary'>
                                        Variant keys are global. Each audience
                                        can allocate traffic differently.
                                    </Typography>
                                    <Tooltip
                                        title='Treatments are stored as strategy variants on every experiment audience.'
                                        arrow
                                    >
                                        <HelpOutlineOutlined
                                            color='disabled'
                                            fontSize='small'
                                        />
                                    </Tooltip>
                                </TreatmentHeader>
                            </Box>
                            <Button
                                startIcon={<Add />}
                                onClick={addTreatment}
                                variant='outlined'
                            >
                                Add treatment
                            </Button>
                        </Box>
                        <VariantGrid>
                            {treatments.map((treatment, index) => (
                                <VariantCard
                                    key={treatment.name}
                                    decorationColor={treatmentColor(
                                        colors,
                                        index,
                                    )}
                                >
                                    <Stack spacing={1.5}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: 1,
                                            }}
                                        >
                                            <TreatmentHeader>
                                                <ColorSwatch
                                                    color={treatmentColor(
                                                        colors,
                                                        index,
                                                    )}
                                                />
                                                <Typography variant='h3'>
                                                    Treatment {index + 1}
                                                </Typography>
                                            </TreatmentHeader>
                                            <IconButton
                                                aria-label={`Remove ${treatment.name}`}
                                                disabled={
                                                    treatments.length <= 2
                                                }
                                                onClick={() =>
                                                    removeTreatment(index)
                                                }
                                                size='small'
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                        <TextField
                                            label='Variant key'
                                            value={treatment.name}
                                            helperText='Letters, numbers, dots, dashes, and underscores only.'
                                            onChange={(event) =>
                                                syncTreatmentRename(
                                                    index,
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Stack>
                                </VariantCard>
                            ))}
                        </VariantGrid>
                    </Stack>

                    <Divider />

                    <Stack spacing={2}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 2,
                                alignItems: 'center',
                            }}
                        >
                            <Box>
                                <Typography variant='h3'>
                                    Treatment properties
                                </Typography>
                                <Typography color='text.secondary'>
                                    Properties are global per treatment and
                                    stored as JSON variant payloads.
                                </Typography>
                            </Box>
                            <Button
                                startIcon={<Add />}
                                onClick={addProperty}
                                variant='outlined'
                            >
                                Add property
                            </Button>
                        </Box>
                        <PropertyGrid
                            style={
                                {
                                    '--treatment-count': treatments.length,
                                } as CSSProperties
                            }
                        >
                            <Typography variant='body2' color='text.secondary'>
                                Property
                            </Typography>
                            {treatments.map((treatment, index) => (
                                <TreatmentHeader key={treatment.name}>
                                    <ColorSwatch
                                        color={treatmentColor(colors, index)}
                                    />
                                    <Typography
                                        variant='body2'
                                        color='text.secondary'
                                    >
                                        {treatment.name}
                                    </Typography>
                                </TreatmentHeader>
                            ))}
                            <span />
                            {propertyNames.map(
                                (propertyName, propertyIndex) => (
                                    <Box
                                        key={propertyIndex}
                                        sx={{ display: 'contents' }}
                                    >
                                        <TextField
                                            label='Property key'
                                            value={propertyName}
                                            onChange={(event) =>
                                                renameProperty(
                                                    propertyIndex,
                                                    createTreatmentKey(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                        {treatments.map(
                                            (treatment, treatmentIndex) => (
                                                <TextField
                                                    key={`${treatment.name}-${propertyName}`}
                                                    label={treatment.name}
                                                    value={
                                                        treatment.properties[
                                                            propertyName
                                                        ] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        updateTreatmentProperty(
                                                            treatmentIndex,
                                                            propertyName,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            ),
                                        )}
                                        <IconButton
                                            aria-label={`Remove ${propertyName}`}
                                            onClick={() =>
                                                removeProperty(propertyName)
                                            }
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                ),
                            )}
                        </PropertyGrid>
                        {!propertyNamesAreValid(propertyNames) ? (
                            <Alert severity='error'>
                                Property keys must be unique and URL friendly.
                            </Alert>
                        ) : null}
                    </Stack>

                    <Divider />

                    <Stack spacing={2}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 2,
                                alignItems: 'center',
                            }}
                        >
                            <Box>
                                <Typography variant='h3'>Audiences</Typography>
                                <Typography color='text.secondary'>
                                    Each audience is a gradual rollout strategy
                                    with its own targeting and allocation.
                                </Typography>
                            </Box>
                            <Button
                                startIcon={<Add />}
                                onClick={addLane}
                                variant='outlined'
                            >
                                Add audience
                            </Button>
                        </Box>
                        {lanes.map((lane, laneIndex) => {
                            const isFallbackLane =
                                laneIndex === lanes.length - 1;

                            return (
                                <LaneCard key={lane.id ?? laneIndex}>
                                    <Stack spacing={1.5}>
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                    'minmax(0, 1fr) minmax(180px, 240px) auto',
                                                gap: 1.5,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box>
                                                {isFallbackLane ? (
                                                    <TreatmentHeader>
                                                        <Typography variant='h3'>
                                                            Fallback
                                                        </Typography>
                                                        <Chip
                                                            size='small'
                                                            label='Catches remaining traffic'
                                                        />
                                                    </TreatmentHeader>
                                                ) : (
                                                    <TextField
                                                        label='Audience name'
                                                        value={lane.name}
                                                        onChange={(event) =>
                                                            updateLane(
                                                                laneIndex,
                                                                {
                                                                    name: event
                                                                        .target
                                                                        .value,
                                                                },
                                                            )
                                                        }
                                                        size='small'
                                                        fullWidth
                                                    />
                                                )}
                                            </Box>
                                            <TextField
                                                select
                                                label='Stickiness'
                                                value={lane.stickiness}
                                                onChange={(event) =>
                                                    updateLane(laneIndex, {
                                                        stickiness:
                                                            event.target.value,
                                                    })
                                                }
                                                size='small'
                                            >
                                                {Array.from(
                                                    new Set([
                                                        'default',
                                                        'userId',
                                                        'sessionId',
                                                        'random',
                                                        lane.stickiness,
                                                    ]),
                                                ).map((option) => (
                                                    <MenuItem
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                            <IconButton
                                                aria-label={`Remove ${lane.name}`}
                                                disabled={isFallbackLane}
                                                onClick={() =>
                                                    removeLane(laneIndex)
                                                }
                                                size='small'
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                        <LaneBody>
                                            <Stack spacing={1}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        gap: 1,
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <TreatmentHeader>
                                                        <Typography variant='h3'>
                                                            Constraints
                                                        </Typography>
                                                        <Tooltip
                                                            title='Audiences are evaluated top-to-bottom. The fallback stays unconstrained so every context receives a treatment.'
                                                            arrow
                                                        >
                                                            <HelpOutlineOutlined
                                                                color='disabled'
                                                                fontSize='small'
                                                            />
                                                        </Tooltip>
                                                    </TreatmentHeader>
                                                    <Button
                                                        startIcon={<Add />}
                                                        onClick={() =>
                                                            addLaneConstraint(
                                                                laneIndex,
                                                            )
                                                        }
                                                        variant='outlined'
                                                        size='small'
                                                        disabled={
                                                            isFallbackLane
                                                        }
                                                    >
                                                        Add
                                                    </Button>
                                                </Box>
                                                {isFallbackLane ? (
                                                    <Typography
                                                        color='text.secondary'
                                                        variant='body2'
                                                    >
                                                        Fallback constraints are
                                                        disabled to avoid
                                                        unassigned contexts.
                                                    </Typography>
                                                ) : lane.constraints.length ===
                                                  0 ? (
                                                    <Typography
                                                        color='text.secondary'
                                                        variant='body2'
                                                    >
                                                        Add targeting rules to
                                                        make this audience
                                                        specific.
                                                    </Typography>
                                                ) : null}
                                                {!isFallbackLane
                                                    ? lane.constraints.map(
                                                          (
                                                              constraint,
                                                              constraintIndex,
                                                          ) =>
                                                              renderConstraint(
                                                                  lane,
                                                                  laneIndex,
                                                                  constraint,
                                                                  constraintIndex,
                                                              ),
                                                      )
                                                    : null}
                                            </Stack>
                                            <Stack spacing={1}>
                                                <Typography variant='h3'>
                                                    Allocation
                                                </Typography>
                                                <AllocationGrid>
                                                    {treatments.map(
                                                        (
                                                            treatment,
                                                            treatmentIndex,
                                                        ) => (
                                                            <TextField
                                                                key={`${laneIndex}-${treatment.name}`}
                                                                label={
                                                                    treatment.name
                                                                }
                                                                type='number'
                                                                value={
                                                                    lane
                                                                        .weights[
                                                                        treatment
                                                                            .name
                                                                    ] ?? 0
                                                                }
                                                                disabled={
                                                                    treatmentIndex ===
                                                                    0
                                                                }
                                                                helperText={
                                                                    treatmentIndex ===
                                                                    0
                                                                        ? 'Calculated'
                                                                        : undefined
                                                                }
                                                                slotProps={{
                                                                    htmlInput: {
                                                                        min: 0,
                                                                        max: 100,
                                                                        step: 0.1,
                                                                    },
                                                                    input: percentInputProps,
                                                                }}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateLaneWeight(
                                                                        laneIndex,
                                                                        treatmentIndex,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                size='small'
                                                            />
                                                        ),
                                                    )}
                                                </AllocationGrid>
                                                {laneTotal(lane) !== 100 ? (
                                                    <Alert severity='error'>
                                                        Current allocation
                                                        total: {laneTotal(lane)}
                                                        %.
                                                    </Alert>
                                                ) : null}
                                            </Stack>
                                        </LaneBody>
                                    </Stack>
                                </LaneCard>
                            );
                        })}
                        {!experimentIsValid(treatments, lanes) ? (
                            <Alert severity='error'>
                                Treatments need unique URL-friendly variant keys
                                and every audience allocation must total 100%.
                            </Alert>
                        ) : null}
                    </Stack>
                </Stack>

                <Stack spacing={2}>
                    <Paper
                        variant='outlined'
                        sx={{ p: 2, borderRadius: 1, boxShadow: 'none' }}
                    >
                        <TreatmentHeader>
                            <VisibilityOutlined color='primary' />
                            <Typography variant='h3'>
                                Evaluation preview
                            </Typography>
                        </TreatmentHeader>
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                            {contextFields.length === 0 ? (
                                <Typography
                                    color='text.secondary'
                                    variant='body2'
                                >
                                    Add constraints or stickiness fields to
                                    preview targeting.
                                </Typography>
                            ) : null}
                            {contextFields.map((field) => (
                                <TextField
                                    key={field}
                                    label={field}
                                    value={previewContext[field] ?? ''}
                                    onChange={(event) =>
                                        setPreviewContext((current) => ({
                                            ...current,
                                            [field]: event.target.value,
                                        }))
                                    }
                                />
                            ))}
                            <Divider />
                            <TreatmentHeader>
                                <CheckCircleOutline color='success' />
                                <Box>
                                    <Typography variant='body2'>
                                        Serves{' '}
                                        <strong>
                                            {preview.treatment?.name ??
                                                'no treatment'}
                                        </strong>
                                    </Typography>
                                    {preview.treatment ? (
                                        <TreatmentHeader>
                                            <ColorSwatch
                                                color={treatmentColor(
                                                    colors,
                                                    previewTreatmentIndex,
                                                )}
                                            />
                                            <Typography
                                                color='text.secondary'
                                                variant='body2'
                                            >
                                                {preview.lane?.name ??
                                                    'No audience'}
                                            </Typography>
                                        </TreatmentHeader>
                                    ) : null}
                                </Box>
                            </TreatmentHeader>
                            <PreviewCode>
                                {formatPreviewPayload(preview.treatment)}
                            </PreviewCode>
                        </Stack>
                    </Paper>
                    <PermissionButton
                        permission={permission}
                        projectId={projectId}
                        environmentId={environment.name}
                        onClick={onSave}
                        disabled={!valid || loading}
                    >
                        Save experiment
                    </PermissionButton>
                    <Button onClick={resetExperiment} variant='text'>
                        Reset
                    </Button>
                </Stack>
            </BuilderBody>
        </Builder>
    );
};

type FeatureExperimentOverviewProps = {
    feature: IFeatureToggle;
    onChange: () => void;
};

export const FeatureExperimentOverview = ({
    feature,
    onChange,
}: FeatureExperimentOverviewProps) => {
    const [selectedEnvironment, setSelectedEnvironment] = useState(
        feature.environments[0]?.name,
    );

    useEffect(() => {
        if (
            selectedEnvironment &&
            feature.environments.some(
                (environment) => environment.name === selectedEnvironment,
            )
        )
            return;
        setSelectedEnvironment(feature.environments[0]?.name);
    }, [feature.environments, selectedEnvironment]);

    const environment = feature.environments.find(
        (environment) => environment.name === selectedEnvironment,
    );

    return (
        <Page>
            <Alert severity='info'>
                Experiment flags use multiple gradual rollout strategies as
                audiences. Constraints live on each strategy; treatment
                properties stay on variant payloads.
            </Alert>
            <EnvironmentPicker>
                {feature.environments.map((environment) => {
                    const config = resolveExperimentConfig(environment);
                    return (
                        <Button
                            key={environment.name}
                            variant={
                                environment.name === selectedEnvironment
                                    ? 'contained'
                                    : 'outlined'
                            }
                            onClick={() =>
                                setSelectedEnvironment(environment.name)
                            }
                        >
                            {environment.name} · {statusText(config)}
                        </Button>
                    );
                })}
            </EnvironmentPicker>
            {environment ? (
                <ExperimentEnvironmentEditor
                    key={environment.name}
                    feature={feature}
                    environment={environment}
                    onSaved={onChange}
                />
            ) : null}
            <Typography color='text.secondary' variant='body2'>
                Need raw strategy controls? Open{' '}
                <MuiLink
                    href='https://docs.getunleash.io/guides/a-b-testing'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    the A/B testing guide
                </MuiLink>
                .
            </Typography>
        </Page>
    );
};

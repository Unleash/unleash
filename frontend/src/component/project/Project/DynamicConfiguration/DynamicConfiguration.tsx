import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tab,
    Tabs,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import Delete from '@mui/icons-material/Delete';
import EditOutlined from '@mui/icons-material/EditOutlined';
import MoreVert from '@mui/icons-material/MoreVert';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useMemo, useState } from 'react';

type ConfigurationType = 'String' | 'Number' | 'Boolean' | 'JSON';

type TargetingRule = {
    id: string;
    contextName: string;
    operator: string;
    contextValue: string;
    version: number;
};

type ConfigurationVersion = {
    version: number;
    value: string;
    description?: string;
    published?: boolean;
};

type DynamicConfigurationItem = {
    key: string;
    description: string;
    type: ConfigurationType;
    versions: ConfigurationVersion[];
    defaultVersions: Record<string, number>;
    rules: Record<string, TargetingRule[]>;
    modified: string;
    minimum?: string;
    maximum?: string;
    schemaTemplate?: string;
    legalValues?: string;
};

const initialConfigurations: DynamicConfigurationItem[] = [
    {
        key: 'api_timeout_ms',
        description: 'Timeout used when calling the payment provider.',
        type: 'Number',
        versions: [
            { version: 1, value: '5000', description: 'Original timeout' },
            {
                version: 2,
                value: '2000',
                description: 'Interactive application timeout',
            },
            { version: 3, value: '4000' },
            { version: 4, value: '3000' },
        ],
        defaultVersions: {
            development: 1,
            staging: 3,
            production: 4,
        },
        rules: {
            development: [
                {
                    id: 'web-app-timeout',
                    contextName: 'appName',
                    operator: 'is',
                    contextValue: 'web-app',
                    version: 2,
                },
            ],
            staging: [],
            production: [],
        },
        minimum: '100',
        maximum: '10000',
        modified: '2 hours ago',
    },
    {
        key: 'promo_banner',
        description: 'Presentation settings for the checkout promotion.',
        type: 'JSON',
        versions: [
            {
                version: 1,
                value: '{"text":"Summer sale","show":true}',
            },
            {
                version: 2,
                value: '{"text":"Summer sale","show":false}',
            },
        ],
        defaultVersions: {
            development: 1,
            staging: 1,
            production: 2,
        },
        rules: {
            development: [],
            staging: [],
            production: [],
        },
        modified: '10 hours ago',
    },
    {
        key: 'max_checkout_items',
        description: 'Maximum number of items accepted by checkout.',
        type: 'Number',
        versions: [
            { version: 1, value: '10' },
            { version: 2, value: '8' },
            { version: 3, value: '50' },
            { version: 4, value: '100' },
        ],
        defaultVersions: {
            development: 1,
            staging: 1,
            production: 2,
        },
        rules: {
            development: [
                {
                    id: 'internal-users',
                    contextName: 'userId',
                    operator: 'is one of',
                    contextValue: 'qa-user, test-user',
                    version: 3,
                },
                {
                    id: 'batch-worker',
                    contextName: 'appName',
                    operator: 'is',
                    contextValue: 'batch-worker',
                    version: 4,
                },
            ],
            staging: [],
            production: [],
        },
        minimum: '1',
        maximum: '100',
        modified: '1 day ago',
    },
];

const StyledEnvironmentTabs = styled(Tabs)(({ theme }) => ({
    minHeight: theme.spacing(4),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    '.MuiTabs-indicator': {
        display: 'none',
    },
}));

const StyledEnvironmentTab = styled(Tab)(({ theme }) => ({
    minHeight: theme.spacing(4),
    minWidth: theme.spacing(10),
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.shape.borderRadius,
    textTransform: 'capitalize',
    '&.Mui-selected': {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.dark,
    },
}));

const StyledDrawerBody = styled(Box)(({ theme }) => ({
    width: 560,
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    [theme.breakpoints.down('sm')]: {
        width: '100vw',
    },
}));

const StyledDrawerContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    overflowY: 'auto',
    flex: 1,
}));

const StyledSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledRule = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledPreview = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.success.border}`,
    backgroundColor: theme.palette.success.light,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
}));

const summarizeValue = (type: ConfigurationType, value: string) => {
    if (type !== 'JSON') {
        return value;
    }

    try {
        const parsed = JSON.parse(value);
        const count =
            parsed && typeof parsed === 'object'
                ? Object.keys(parsed).length
                : 0;
        return `JSON object (${count} fields)`;
    } catch {
        return 'Invalid JSON';
    }
};

const emptyConfiguration = (
    environments: string[],
): DynamicConfigurationItem => ({
    key: '',
    description: '',
    type: 'String',
    versions: [
        {
            version: 1,
            value: '',
            description: 'Initial version',
            published: false,
        },
    ],
    defaultVersions: Object.fromEntries(
        environments.map((environment) => [environment, 1]),
    ),
    rules: Object.fromEntries(
        environments.map((environment) => [environment, []]),
    ),
    modified: 'Just now',
});

const ConfigurationEditor = ({
    open,
    configuration,
    environment,
    onClose,
    onSave,
}: {
    open: boolean;
    configuration: DynamicConfigurationItem | null;
    environment: string;
    onClose: () => void;
    onSave: (configuration: DynamicConfigurationItem) => void;
}) => {
    const [draft, setDraft] = useState<DynamicConfigurationItem | null>(
        configuration,
    );

    if (!draft) {
        return null;
    }

    const rules = draft.rules[environment] ?? [];
    const defaultVersion = draft.defaultVersions[environment] ?? 1;
    const matchedRule = rules[0];
    const resolvedVersion = matchedRule?.version ?? defaultVersion;
    const resolvedValue =
        draft.versions.find(({ version }) => version === resolvedVersion)
            ?.value ?? '';

    const updateRule = (
        ruleId: string,
        update: Partial<TargetingRule>,
    ): void => {
        setDraft({
            ...draft,
            rules: {
                ...draft.rules,
                [environment]: rules.map((rule) =>
                    rule.id === ruleId ? { ...rule, ...update } : rule,
                ),
            },
        });
    };

    const addRule = () => {
        const id = `rule-${rules.length + 1}`;
        setDraft({
            ...draft,
            rules: {
                ...draft.rules,
                [environment]: [
                    ...rules,
                    {
                        id,
                        contextName: 'appName',
                        operator: 'is',
                        contextValue: '',
                        version: defaultVersion,
                    },
                ],
            },
        });
    };

    const addVersion = () => {
        const version =
            Math.max(0, ...draft.versions.map((item) => item.version)) + 1;
        const currentValue =
            draft.versions.find((item) => item.version === defaultVersion)
                ?.value ?? '';
        setDraft({
            ...draft,
            versions: [
                ...draft.versions,
                {
                    version,
                    value: currentValue,
                    description: 'New version',
                    published: false,
                },
            ],
        });
    };

    return (
        <Drawer anchor='right' open={open} onClose={onClose}>
            <StyledDrawerBody>
                <Stack
                    direction='row'
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 2,
                    }}
                >
                    <Box>
                        <Typography variant='h2'>
                            {draft.key
                                ? `Editing configuration: ${draft.key}`
                                : 'Create configuration'}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Environment: {environment}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} aria-label='Close editor'>
                        <Close />
                    </IconButton>
                </Stack>
                <Divider />
                <StyledDrawerContent>
                    <Alert severity='info' sx={{ marginBottom: 3 }}>
                        Values are immutable versions. Environments, targeting
                        rules, and feature variants select an exact version.
                    </Alert>

                    <StyledSection>
                        <Typography variant='h3' sx={{ marginBottom: 2 }}>
                            General information
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                label='Key'
                                value={draft.key}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        key: event.target.value,
                                    })
                                }
                                placeholder='checkout/api_timeout_ms'
                                fullWidth
                            />
                            <TextField
                                label='Description'
                                value={draft.description}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        description: event.target.value,
                                    })
                                }
                                multiline
                                minRows={2}
                                fullWidth
                            />
                        </Stack>
                    </StyledSection>

                    <StyledSection>
                        <Typography variant='h3' sx={{ marginBottom: 2 }}>
                            Type and validation
                        </Typography>
                        <Stack spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel id='configuration-schema-label'>
                                    Schema template
                                </InputLabel>
                                <Select
                                    labelId='configuration-schema-label'
                                    label='Schema template'
                                    value={draft.schemaTemplate ?? 'Custom'}
                                    onChange={(event) =>
                                        setDraft({
                                            ...draft,
                                            schemaTemplate: event.target.value,
                                        })
                                    }
                                >
                                    <MenuItem value='Custom'>Custom</MenuItem>
                                    <MenuItem value='PostgreSQL'>
                                        PostgreSQL
                                    </MenuItem>
                                    <MenuItem value='HTTP client'>
                                        HTTP client
                                    </MenuItem>
                                    <MenuItem value='Retry policy'>
                                        Retry policy
                                    </MenuItem>
                                    <MenuItem value='Logging'>Logging</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id='configuration-type-label'>
                                    Type
                                </InputLabel>
                                <Select
                                    labelId='configuration-type-label'
                                    label='Type'
                                    value={draft.type}
                                    onChange={(event) =>
                                        setDraft({
                                            ...draft,
                                            type: event.target
                                                .value as ConfigurationType,
                                        })
                                    }
                                >
                                    <MenuItem value='String'>String</MenuItem>
                                    <MenuItem value='Number'>Number</MenuItem>
                                    <MenuItem value='Boolean'>Boolean</MenuItem>
                                    <MenuItem value='JSON'>JSON</MenuItem>
                                </Select>
                            </FormControl>
                            {draft.type === 'Number' ? (
                                <Stack direction='row' spacing={2}>
                                    <TextField
                                        label='Minimum'
                                        value={draft.minimum ?? ''}
                                        onChange={(event) =>
                                            setDraft({
                                                ...draft,
                                                minimum: event.target.value,
                                            })
                                        }
                                        fullWidth
                                    />
                                    <TextField
                                        label='Maximum'
                                        value={draft.maximum ?? ''}
                                        onChange={(event) =>
                                            setDraft({
                                                ...draft,
                                                maximum: event.target.value,
                                            })
                                        }
                                        fullWidth
                                    />
                                </Stack>
                            ) : null}
                            {draft.type === 'String' ? (
                                <TextField
                                    label='Legal values'
                                    helperText='Comma-separated, for example ERROR, INFO, WARN'
                                    value={draft.legalValues ?? ''}
                                    onChange={(event) =>
                                        setDraft({
                                            ...draft,
                                            legalValues: event.target.value,
                                        })
                                    }
                                    fullWidth
                                />
                            ) : null}
                        </Stack>
                    </StyledSection>

                    <StyledSection>
                        <Stack
                            direction='row'
                            sx={{
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 2,
                            }}
                        >
                            <Box>
                                <Typography variant='h3'>Versions</Typography>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    Published versions are immutable and may be
                                    referenced by experiments.
                                </Typography>
                            </Box>
                            <Button startIcon={<Add />} onClick={addVersion}>
                                Create version
                            </Button>
                        </Stack>
                        <Stack spacing={2}>
                            {draft.versions.map((item) => (
                                <StyledRule key={item.version}>
                                    <Stack
                                        direction='row'
                                        spacing={1}
                                        sx={{
                                            alignItems: 'center',
                                            marginBottom: 2,
                                        }}
                                    >
                                        <Chip
                                            size='small'
                                            label={`Version ${item.version}`}
                                        />
                                        <Chip
                                            size='small'
                                            variant='outlined'
                                            label={
                                                item.published === false
                                                    ? 'Draft'
                                                    : 'Published'
                                            }
                                        />
                                        {item.version === defaultVersion ? (
                                            <Chip
                                                size='small'
                                                color='primary'
                                                label={`Default in ${environment}`}
                                            />
                                        ) : null}
                                    </Stack>
                                    <TextField
                                        label='Description'
                                        value={item.description ?? ''}
                                        disabled={item.published !== false}
                                        onChange={(event) =>
                                            setDraft({
                                                ...draft,
                                                versions: draft.versions.map(
                                                    (version) =>
                                                        version.version ===
                                                        item.version
                                                            ? {
                                                                  ...version,
                                                                  description:
                                                                      event
                                                                          .target
                                                                          .value,
                                                              }
                                                            : version,
                                                ),
                                            })
                                        }
                                        fullWidth
                                        sx={{ marginBottom: 2 }}
                                    />
                                    <TextField
                                        label='Value'
                                        value={item.value}
                                        disabled={item.published !== false}
                                        onChange={(event) =>
                                            setDraft({
                                                ...draft,
                                                versions: draft.versions.map(
                                                    (version) =>
                                                        version.version ===
                                                        item.version
                                                            ? {
                                                                  ...version,
                                                                  value: event
                                                                      .target
                                                                      .value,
                                                              }
                                                            : version,
                                                ),
                                            })
                                        }
                                        multiline={draft.type === 'JSON'}
                                        minRows={
                                            draft.type === 'JSON'
                                                ? 4
                                                : undefined
                                        }
                                        fullWidth
                                    />
                                </StyledRule>
                            ))}
                        </Stack>
                        <TextField
                            select
                            label={`Default version in ${environment}`}
                            value={defaultVersion}
                            onChange={(event) =>
                                setDraft({
                                    ...draft,
                                    defaultVersions: {
                                        ...draft.defaultVersions,
                                        [environment]: Number(
                                            event.target.value,
                                        ),
                                    },
                                })
                            }
                            fullWidth
                            sx={{ marginTop: 2 }}
                        >
                            {draft.versions.map((item) => (
                                <MenuItem
                                    key={item.version}
                                    value={item.version}
                                >
                                    Version {item.version}:&nbsp;
                                    {summarizeValue(draft.type, item.value)}
                                </MenuItem>
                            ))}
                        </TextField>
                    </StyledSection>

                    <StyledSection>
                        <Stack
                            direction='row'
                            sx={{
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 2,
                            }}
                        >
                            <Box>
                                <Typography variant='h3'>
                                    Targeted version selectors
                                </Typography>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    First matching expression selects its
                                    referenced version.
                                </Typography>
                            </Box>
                            <Button startIcon={<Add />} onClick={addRule}>
                                Add rule
                            </Button>
                        </Stack>
                        <Stack spacing={2}>
                            {rules.map((rule, index) => (
                                <StyledRule key={rule.id}>
                                    <Stack
                                        direction='row'
                                        sx={{
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 2,
                                        }}
                                    >
                                        <Chip
                                            size='small'
                                            label={`Priority ${index + 1}`}
                                        />
                                        <IconButton
                                            size='small'
                                            aria-label='Delete rule'
                                            onClick={() =>
                                                setDraft({
                                                    ...draft,
                                                    rules: {
                                                        ...draft.rules,
                                                        [environment]:
                                                            rules.filter(
                                                                (item) =>
                                                                    item.id !==
                                                                    rule.id,
                                                            ),
                                                    },
                                                })
                                            }
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Stack>
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={1}
                                        sx={{ marginBottom: 2 }}
                                    >
                                        <TextField
                                            select
                                            label='Context field'
                                            value={rule.contextName}
                                            onChange={(event) =>
                                                updateRule(rule.id, {
                                                    contextName:
                                                        event.target.value,
                                                })
                                            }
                                            fullWidth
                                        >
                                            <MenuItem value='appName'>
                                                appName
                                            </MenuItem>
                                            <MenuItem value='userId'>
                                                userId
                                            </MenuItem>
                                            <MenuItem value='environment'>
                                                environment
                                            </MenuItem>
                                            <MenuItem value='tenantId'>
                                                tenantId
                                            </MenuItem>
                                        </TextField>
                                        <TextField
                                            select
                                            label='Operator'
                                            value={rule.operator}
                                            onChange={(event) =>
                                                updateRule(rule.id, {
                                                    operator:
                                                        event.target.value,
                                                })
                                            }
                                            fullWidth
                                        >
                                            <MenuItem value='is'>is</MenuItem>
                                            <MenuItem value='is one of'>
                                                is one of
                                            </MenuItem>
                                            <MenuItem value='starts with'>
                                                starts with
                                            </MenuItem>
                                        </TextField>
                                        <TextField
                                            label='Value'
                                            value={rule.contextValue}
                                            onChange={(event) =>
                                                updateRule(rule.id, {
                                                    contextValue:
                                                        event.target.value,
                                                })
                                            }
                                            fullWidth
                                        />
                                    </Stack>
                                    <TextField
                                        select
                                        label='Selected version'
                                        value={rule.version}
                                        onChange={(event) =>
                                            updateRule(rule.id, {
                                                version: Number(
                                                    event.target.value,
                                                ),
                                            })
                                        }
                                        fullWidth
                                    >
                                        {draft.versions.map((item) => (
                                            <MenuItem
                                                key={item.version}
                                                value={item.version}
                                            >
                                                Version {item.version}:&nbsp;
                                                {summarizeValue(
                                                    draft.type,
                                                    item.value,
                                                )}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </StyledRule>
                            ))}
                            {rules.length === 0 ? (
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    No targeted selectors. All contexts resolve
                                    to the environment's default version.
                                </Typography>
                            ) : null}
                        </Stack>
                    </StyledSection>

                    <StyledSection>
                        <Typography variant='h3' sx={{ marginBottom: 0.5 }}>
                            Resolved value preview
                        </Typography>
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ marginBottom: 2 }}
                        >
                            Sample context uses the first rule for this visual
                            prototype.
                        </Typography>
                        <StyledPreview>
                            <Typography
                                variant='body2'
                                sx={{ fontWeight: 'bold' }}
                            >
                                {matchedRule
                                    ? `Matched ${matchedRule.contextName} ${matchedRule.operator} ${matchedRule.contextValue}`
                                    : 'No targeted rule matched'}
                            </Typography>
                            <Typography
                                component='pre'
                                sx={{
                                    margin: 0,
                                    marginTop: 1,
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace',
                                }}
                            >
                                Version {resolvedVersion}
                                {'\n'}
                                {resolvedValue || 'No value configured'}
                            </Typography>
                        </StyledPreview>
                    </StyledSection>
                </StyledDrawerContent>
                <Divider />
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{ justifyContent: 'flex-end', padding: 2 }}
                >
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant='contained'
                        disabled={
                            !draft.key ||
                            draft.versions.length === 0 ||
                            draft.versions.some(({ value }) => !value)
                        }
                        onClick={() => onSave(draft)}
                    >
                        Save configuration
                    </Button>
                </Stack>
            </StyledDrawerBody>
        </Drawer>
    );
};

export const DynamicConfiguration = () => {
    const projectId = useRequiredPathParam('projectId');
    const { project } = useProjectOverview(projectId);
    const environments = useMemo(() => {
        const configured = project.environments?.map(
            ({ environment }) => environment,
        );
        return configured?.length
            ? configured
            : ['development', 'staging', 'production'];
    }, [project.environments]);
    const [environment, setEnvironment] = useState(
        environments.includes('development') ? 'development' : environments[0],
    );
    const [configurations, setConfigurations] = useState(initialConfigurations);
    const [selected, setSelected] = useState<DynamicConfigurationItem | null>(
        null,
    );
    const [editorOpen, setEditorOpen] = useState(false);

    const openConfiguration = (configuration: DynamicConfigurationItem) => {
        setSelected(structuredClone(configuration));
        setEditorOpen(true);
    };

    const createConfiguration = () => {
        setSelected(emptyConfiguration(environments));
        setEditorOpen(true);
    };

    const saveConfiguration = (configuration: DynamicConfigurationItem) => {
        const publishedConfiguration = {
            ...configuration,
            versions: configuration.versions.map((version) => ({
                ...version,
                published: true,
            })),
        };
        setConfigurations((current) => {
            const exists = current.some(
                (item) => item.key === publishedConfiguration.key,
            );
            if (exists) {
                return current.map((item) =>
                    item.key === publishedConfiguration.key
                        ? {
                              ...publishedConfiguration,
                              modified: 'Just now',
                          }
                        : item,
                );
            }
            return [
                ...current,
                { ...publishedConfiguration, modified: 'Just now' },
            ];
        });
        setEditorOpen(false);
    };

    const header = (
        <PageHeader
            title='Dynamic configuration'
            subtitle='Typed application settings evaluated locally by backend SDKs.'
            actions={
                <Stack
                    direction='row'
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                >
                    <StyledEnvironmentTabs
                        value={environment}
                        onChange={(_, value: string) => setEnvironment(value)}
                    >
                        {environments.map((item) => (
                            <StyledEnvironmentTab
                                key={item}
                                value={item}
                                label={item}
                            />
                        ))}
                    </StyledEnvironmentTabs>
                    <Button
                        variant='contained'
                        startIcon={<Add />}
                        onClick={createConfiguration}
                    >
                        Create configuration
                    </Button>
                </Stack>
            }
        />
    );

    return (
        <>
            <PageContent header={header} disablePadding>
                <Alert severity='info' sx={{ margin: 3, marginBottom: 2 }}>
                    Visual prototype. Versions belong to the project; the
                    selected environment determines which versions are used by
                    default and by targeting.
                </Alert>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Configuration key</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Selected version</TableCell>
                            <TableCell>Available versions</TableCell>
                            <TableCell>Selectors</TableCell>
                            <TableCell>Modified</TableCell>
                            <TableCell align='right'>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {configurations.map((configuration) => {
                            const rules =
                                configuration.rules[environment] ?? [];
                            const defaultVersion =
                                configuration.defaultVersions[environment];
                            const value =
                                configuration.versions.find(
                                    ({ version }) => version === defaultVersion,
                                )?.value ?? '';

                            return (
                                <TableRow
                                    hover
                                    key={configuration.key}
                                    onClick={() =>
                                        openConfiguration(configuration)
                                    }
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 'bold' }}>
                                            {configuration.key}
                                        </Typography>
                                        <Typography
                                            variant='body2'
                                            color='text.secondary'
                                        >
                                            {configuration.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={configuration.type}
                                            size='small'
                                            variant='outlined'
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 'bold' }}>
                                            Version {defaultVersion}
                                        </Typography>
                                        <Typography
                                            variant='body2'
                                            color='text.secondary'
                                        >
                                            {summarizeValue(
                                                configuration.type,
                                                value,
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {configuration.versions.length}
                                    </TableCell>
                                    <TableCell>
                                        {rules.length === 0
                                            ? 'Default only'
                                            : `${rules.length} ${
                                                  rules.length === 1
                                                      ? 'selector'
                                                      : 'selectors'
                                              }`}
                                    </TableCell>
                                    <TableCell>
                                        {configuration.modified}
                                    </TableCell>
                                    <TableCell align='right'>
                                        <IconButton
                                            aria-label={`Edit ${configuration.key}`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                openConfiguration(
                                                    configuration,
                                                );
                                            }}
                                        >
                                            <EditOutlined />
                                        </IconButton>
                                        <IconButton
                                            aria-label={`More actions for ${configuration.key}`}
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </PageContent>
            <ConfigurationEditor
                key={`${selected?.key ?? 'new'}-${environment}-${editorOpen}`}
                open={editorOpen}
                configuration={selected}
                environment={environment}
                onClose={() => setEditorOpen(false)}
                onSave={saveConfiguration}
            />
        </>
    );
};

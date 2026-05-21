import {
    Fragment,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FC,
} from 'react';
import {
    Box,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    styled,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon';
import type { FeatureSearchResponseSchema } from 'openapi';

type LifecycleStageName =
    | 'initial'
    | 'pre-live'
    | 'live'
    | 'completed'
    | 'archived';

type ResolvedFeature = {
    name: string;
    project: string | null;
    lifecycleStage: LifecycleStageName | null;
    type: string | null;
    found: boolean;
};

type ResolvedEntry = ResolvedFeature | { loading: true };

type ResolvedMap = Record<string, ResolvedEntry>;

type GroupKey = LifecycleStageName | 'loading' | 'unknown';

const STAGE_ORDER: LifecycleStageName[] = [
    'initial',
    'pre-live',
    'live',
    'completed',
    'archived',
];

const STAGE_LABEL: Record<LifecycleStageName, string> = {
    initial: 'Initial',
    'pre-live': 'Pre-live',
    live: 'Live',
    completed: 'Completed',
    archived: 'Archived',
};

const STAGE_DESCRIPTION: Record<LifecycleStageName, string> = {
    initial: 'Defined but not yet seen in any environment.',
    'pre-live': 'Seen in non-production environments only.',
    live: 'Currently in use in production.',
    completed: 'Rollout finished; flag is being kept or discarded.',
    archived: 'No longer in use.',
};

const StyledSectionHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
}));

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledSectionMeta = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledSurface = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
}));

const StyledTable = styled(Table)(({ theme }) => ({
    tableLayout: 'fixed',
    '& th, & td': {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    '& tbody tr': {
        height: theme.shape.tableRowHeightCompact,
    },
    '& col.col-name': { width: 'auto' },
    '& col.col-project': { width: '22%' },
    '& col.col-type': { width: '18%' },
    '& col.col-stage': { width: '18%' },
    [theme.breakpoints.down('md')]: {
        '& col.col-project, & col.col-type': { width: '0%' },
        '& th.col-project, & th.col-type, & td.col-project, & td.col-type': {
            display: 'none',
        },
    },
}));

const StyledGroupRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    '&.MuiTableRow-root:hover': {
        backgroundColor: theme.palette.background.elevation1,
    },
}));

const StyledGroupCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(0.75, 2),
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledGroupButton = styled('button')(({ theme }) => ({
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    cursor: 'pointer',
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
        borderRadius: theme.shape.borderRadius,
    },
}));

const StyledChevron = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    color: theme.palette.text.disabled,
    '& svg': { fontSize: 16 },
}));

const StyledStageIcon = styled(Box)({
    display: 'inline-flex',
    alignItems: 'center',
    '& svg': {
        height: 18,
        width: 'auto',
        display: 'block',
    },
});

const StyledGroupCount = styled('span')(({ theme }) => ({
    color: theme.palette.text.disabled,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightRegular,
    textTransform: 'none',
    letterSpacing: 0,
    marginLeft: theme.spacing(0.25),
}));

const StyledNameCell = styled(TableCell)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
    maxWidth: 360,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledNameWrapper = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
}));

const StyledNameIcon = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    color: theme.palette.text.disabled,
    '& svg': { fontSize: 16 },
}));

const StyledNameText = styled('span')({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const StyledMetaCell = styled(TableCell)(({ theme }) => ({
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const StyledDash = styled('span')(({ theme }) => ({
    color: theme.palette.text.disabled,
}));

const isKnownStage = (stage?: string | null): stage is LifecycleStageName =>
    stage === 'initial' ||
    stage === 'pre-live' ||
    stage === 'live' ||
    stage === 'completed' ||
    stage === 'archived';

type SingleFeatureLoaderProps = {
    featureName: string;
    onResolved: (featureName: string, resolved: ResolvedFeature) => void;
};

const SingleFeatureLoader: FC<SingleFeatureLoaderProps> = memo(
    ({ featureName, onResolved }) => {
        const { features, loading } = useFeatureSearch({
            query: featureName,
            limit: '10',
        });

        useEffect(() => {
            if (loading) return;
            const match = (features as FeatureSearchResponseSchema[]).find(
                (feature) => feature.name === featureName,
            );
            if (!match) {
                onResolved(featureName, {
                    name: featureName,
                    project: null,
                    lifecycleStage: null,
                    type: null,
                    found: false,
                });
                return;
            }
            const stage = match.lifecycle?.stage;
            onResolved(featureName, {
                name: featureName,
                project: match.project,
                lifecycleStage: isKnownStage(stage) ? stage : null,
                type: match.type ?? null,
                found: true,
            });
        }, [featureName, features, loading, onResolved]);

        return null;
    },
);

SingleFeatureLoader.displayName = 'SingleFeatureLoader';

const groupLabel = (key: GroupKey): string => {
    if (key === 'loading') return 'Loading';
    if (key === 'unknown') return 'Not found';
    return STAGE_LABEL[key];
};

const groupTooltip = (key: GroupKey): string | null => {
    if (key === 'loading' || key === 'unknown') return null;
    return STAGE_DESCRIPTION[key];
};

export type FollowedFeaturesListProps = {
    featureNames: string[];
};

export const FollowedFeaturesList: FC<FollowedFeaturesListProps> = ({
    featureNames,
}) => {
    const [resolved, setResolved] = useState<ResolvedMap>({});
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const followed = useMemo(() => featureNames, [featureNames]);

    useEffect(() => {
        setResolved((current) => {
            const next: ResolvedMap = {};
            for (const name of followed) {
                next[name] = current[name] ?? { loading: true };
            }
            return next;
        });
    }, [followed]);

    const handleResolved = useCallback(
        (featureName: string, resolvedFeature: ResolvedFeature) => {
            setResolved((current) => {
                const existing = current[featureName];
                if (
                    existing &&
                    'found' in existing &&
                    existing.found === resolvedFeature.found &&
                    existing.lifecycleStage ===
                        resolvedFeature.lifecycleStage &&
                    existing.project === resolvedFeature.project &&
                    existing.type === resolvedFeature.type
                ) {
                    return current;
                }
                return { ...current, [featureName]: resolvedFeature };
            });
        },
        [],
    );

    const groups = useMemo(() => {
        const byKey: Record<string, ResolvedEntry[]> = {};
        for (const name of followed) {
            const entry = resolved[name];
            if (!entry || 'loading' in entry) {
                if (!byKey.loading) byKey.loading = [];
                byKey.loading.push({ loading: true } as ResolvedEntry);
                continue;
            }
            if (!entry.found || !entry.lifecycleStage) {
                if (!byKey.unknown) byKey.unknown = [];
                byKey.unknown.push(entry);
                continue;
            }
            if (!byKey[entry.lifecycleStage]) byKey[entry.lifecycleStage] = [];
            byKey[entry.lifecycleStage].push(entry);
        }
        return byKey;
    }, [followed, resolved]);

    if (followed.length === 0) return null;

    const orderedKeys: GroupKey[] = [
        ...STAGE_ORDER.filter((key) => (groups[key] ?? []).length > 0),
        ...(groups.loading?.length ? (['loading'] as const) : []),
        ...(groups.unknown?.length ? (['unknown'] as const) : []),
    ];

    const toggleGroup = (key: GroupKey) =>
        setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

    const resolvedCount = followed.filter((name) => {
        const entry = resolved[name];
        return entry && !('loading' in entry);
    }).length;

    return (
        <Box>
            {followed.map((name) => (
                <SingleFeatureLoader
                    key={name}
                    featureName={name}
                    onResolved={handleResolved}
                />
            ))}
            <StyledSectionHeader>
                <StyledSectionTitle>Followed features</StyledSectionTitle>
                <StyledSectionMeta>
                    {resolvedCount === followed.length
                        ? `${followed.length} total`
                        : `${resolvedCount} of ${followed.length} resolved`}
                </StyledSectionMeta>
            </StyledSectionHeader>
            <StyledSurface>
                <StyledTable>
                    <colgroup>
                        <col className='col-name' />
                        <col className='col-project' />
                        <col className='col-type' />
                        <col className='col-stage' />
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell className='col-name'>Name</TableCell>
                            <TableCell className='col-project'>
                                Project
                            </TableCell>
                            <TableCell className='col-type'>Type</TableCell>
                            <TableCell className='col-stage'>
                                Lifecycle stage
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orderedKeys.map((key) => {
                            const entries = groups[key] ?? [];
                            const isCollapsed = Boolean(collapsed[key]);
                            const isStage =
                                key !== 'loading' && key !== 'unknown';
                            const tooltip = groupTooltip(key);

                            const groupHeader = (
                                <StyledGroupButton
                                    type='button'
                                    aria-expanded={!isCollapsed}
                                    onClick={() => toggleGroup(key)}
                                >
                                    <StyledChevron>
                                        {isCollapsed ? (
                                            <ChevronRightIcon />
                                        ) : (
                                            <ExpandMoreIcon />
                                        )}
                                    </StyledChevron>
                                    {isStage ? (
                                        <StyledStageIcon>
                                            <FeatureLifecycleStageIcon
                                                stage={{ name: key }}
                                            />
                                        </StyledStageIcon>
                                    ) : null}
                                    <span>{groupLabel(key)}</span>
                                    <StyledGroupCount>
                                        {entries.length}
                                    </StyledGroupCount>
                                </StyledGroupButton>
                            );

                            return (
                                <Fragment key={key}>
                                    <StyledGroupRow>
                                        <StyledGroupCell colSpan={4}>
                                            {tooltip ? (
                                                <Tooltip
                                                    arrow
                                                    title={tooltip}
                                                    placement='top-start'
                                                >
                                                    {groupHeader}
                                                </Tooltip>
                                            ) : (
                                                groupHeader
                                            )}
                                        </StyledGroupCell>
                                    </StyledGroupRow>
                                    {!isCollapsed
                                        ? entries.map((entry, index) => {
                                              if ('loading' in entry) {
                                                  return (
                                                      <TableRow
                                                          key={`loading-${index}`}
                                                          aria-busy='true'
                                                      >
                                                          <TableCell className='col-name'>
                                                              <Skeleton width='60%' />
                                                          </TableCell>
                                                          <TableCell className='col-project'>
                                                              <Skeleton width='70%' />
                                                          </TableCell>
                                                          <TableCell className='col-type'>
                                                              <Skeleton width='50%' />
                                                          </TableCell>
                                                          <TableCell className='col-stage'>
                                                              <Skeleton width='40%' />
                                                          </TableCell>
                                                      </TableRow>
                                                  );
                                              }
                                              return (
                                                  <TableRow key={entry.name}>
                                                      <StyledNameCell className='col-name'>
                                                          <StyledNameWrapper>
                                                              <StyledNameIcon>
                                                                  <FlagOutlinedIcon />
                                                              </StyledNameIcon>
                                                              <StyledNameText
                                                                  title={
                                                                      entry.name
                                                                  }
                                                              >
                                                                  {entry.name}
                                                              </StyledNameText>
                                                          </StyledNameWrapper>
                                                      </StyledNameCell>
                                                      <StyledMetaCell className='col-project'>
                                                          {entry.project ?? (
                                                              <StyledDash>
                                                                  —
                                                              </StyledDash>
                                                          )}
                                                      </StyledMetaCell>
                                                      <StyledMetaCell
                                                          className='col-type'
                                                          sx={{
                                                              textTransform:
                                                                  'capitalize',
                                                          }}
                                                      >
                                                          {entry.type ?? (
                                                              <StyledDash>
                                                                  —
                                                              </StyledDash>
                                                          )}
                                                      </StyledMetaCell>
                                                      <StyledMetaCell className='col-stage'>
                                                          {entry.lifecycleStage ? (
                                                              <Box
                                                                  sx={{
                                                                      display:
                                                                          'inline-flex',
                                                                      alignItems:
                                                                          'center',
                                                                      gap: 0.75,
                                                                  }}
                                                              >
                                                                  <StyledStageIcon>
                                                                      <FeatureLifecycleStageIcon
                                                                          stage={{
                                                                              name: entry.lifecycleStage,
                                                                          }}
                                                                      />
                                                                  </StyledStageIcon>
                                                                  <span>
                                                                      {
                                                                          STAGE_LABEL[
                                                                              entry
                                                                                  .lifecycleStage
                                                                          ]
                                                                      }
                                                                  </span>
                                                              </Box>
                                                          ) : (
                                                              <StyledDash>
                                                                  —
                                                              </StyledDash>
                                                          )}
                                                      </StyledMetaCell>
                                                  </TableRow>
                                              );
                                          })
                                        : null}
                                </Fragment>
                            );
                        })}
                    </TableBody>
                </StyledTable>
            </StyledSurface>
        </Box>
    );
};

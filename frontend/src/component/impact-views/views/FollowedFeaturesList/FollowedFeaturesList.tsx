import { Fragment, useMemo, useState, type FC } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    styled,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon';
import { getFeatureLifecycleName } from 'component/common/FeatureLifecycle/getFeatureLifecycleName';

export type LifecycleStageName =
    | 'initial'
    | 'pre-live'
    | 'live'
    | 'completed'
    | 'archived';

export type ResolvedFeature = {
    name: string;
    project: string | null;
    lifecycleStage: LifecycleStageName | null;
    type: string | null;
    found: boolean;
};

type GroupKey = LifecycleStageName | 'unknown';

const STAGE_ORDER: LifecycleStageName[] = [
    'initial',
    'pre-live',
    'live',
    'completed',
    'archived',
];

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

const StyledGroupRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledGroupCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(0.75, 2),
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
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
    fontWeight: theme.typography.fontWeightRegular,
    textTransform: 'none',
    letterSpacing: 0,
    marginLeft: theme.spacing(0.25),
}));

const StyledNameWrapper = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
}));

const StyledNameIcon = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    color: theme.palette.text.disabled,
    '& svg': { fontSize: 16 },
}));

const StyledStageWrapper = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
}));

const StyledDash = styled('span')(({ theme }) => ({
    color: theme.palette.text.disabled,
}));

const groupLabel = (key: GroupKey): string =>
    key === 'unknown' ? 'Not found' : getFeatureLifecycleName(key);

export type FollowedFeaturesListProps = {
    features: ResolvedFeature[];
};

export const FollowedFeaturesList: FC<FollowedFeaturesListProps> = ({
    features,
}) => {
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const groups = useMemo(() => {
        const byKey: Record<string, ResolvedFeature[]> = {};
        for (const feature of features) {
            const key =
                feature.found && feature.lifecycleStage
                    ? feature.lifecycleStage
                    : 'unknown';
            if (!byKey[key]) byKey[key] = [];
            byKey[key].push(feature);
        }
        return byKey;
    }, [features]);

    if (features.length === 0) return null;

    const orderedKeys: GroupKey[] = [
        ...STAGE_ORDER.filter((key) => (groups[key] ?? []).length > 0),
        ...(groups.unknown?.length ? (['unknown'] as const) : []),
    ];

    const toggleGroup = (key: GroupKey) =>
        setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <Box>
            <StyledSectionHeader>
                <StyledSectionTitle>Followed features</StyledSectionTitle>
                <StyledSectionMeta>{`${features.length} total`}</StyledSectionMeta>
            </StyledSectionHeader>
            <StyledSurface>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Lifecycle stage</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orderedKeys.map((key) => {
                            const entries = groups[key] ?? [];
                            const isCollapsed = Boolean(collapsed[key]);
                            const isStage = key !== 'unknown';

                            return (
                                <Fragment key={key}>
                                    <StyledGroupRow>
                                        <StyledGroupCell colSpan={4}>
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
                                                            stage={{
                                                                name: key,
                                                            }}
                                                        />
                                                    </StyledStageIcon>
                                                ) : null}
                                                <span>{groupLabel(key)}</span>
                                                <StyledGroupCount>
                                                    {entries.length}
                                                </StyledGroupCount>
                                            </StyledGroupButton>
                                        </StyledGroupCell>
                                    </StyledGroupRow>
                                    {!isCollapsed
                                        ? entries.map((entry) => (
                                              <TableRow key={entry.name}>
                                                  <TableCell>
                                                      <StyledNameWrapper>
                                                          <StyledNameIcon>
                                                              <FlagOutlinedIcon />
                                                          </StyledNameIcon>
                                                          <span>
                                                              {entry.name}
                                                          </span>
                                                      </StyledNameWrapper>
                                                  </TableCell>
                                                  <TableCell>
                                                      {entry.project ?? (
                                                          <StyledDash>
                                                              —
                                                          </StyledDash>
                                                      )}
                                                  </TableCell>
                                                  <TableCell
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
                                                  </TableCell>
                                                  <TableCell>
                                                      {entry.lifecycleStage ? (
                                                          <StyledStageWrapper>
                                                              <StyledStageIcon>
                                                                  <FeatureLifecycleStageIcon
                                                                      stage={{
                                                                          name: entry.lifecycleStage,
                                                                      }}
                                                                  />
                                                              </StyledStageIcon>
                                                              <span>
                                                                  {getFeatureLifecycleName(
                                                                      entry.lifecycleStage,
                                                                  )}
                                                              </span>
                                                          </StyledStageWrapper>
                                                      ) : (
                                                          <StyledDash>
                                                              —
                                                          </StyledDash>
                                                      )}
                                                  </TableCell>
                                              </TableRow>
                                          ))
                                        : null}
                                </Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </StyledSurface>
        </Box>
    );
};

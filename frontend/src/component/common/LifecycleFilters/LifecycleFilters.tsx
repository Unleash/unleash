import { Box, Chip, styled } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import type { FilterItemParamHolder } from '../../filter/Filters/Filters.tsx';
import type { LifecycleStage } from '../../feature/FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage.tsx';
import { FeatureLifecycleStageIcon } from '../FeatureLifecycle/FeatureLifecycleStageIcon.tsx';

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{
    isActive?: boolean;
}>(({ theme, label }) => ({
    borderRadius: 0,
    padding: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
    height: 'auto',
    '&[data-selected="true"]': {
        backgroundColor: theme.palette.secondary.light,
        fontWeight: 'bold',
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    },
    ':focus-visible': {
        outline: `1px solid ${theme.palette.primary.main}`,
        borderColor: theme.palette.primary.main,
    },
    '&:first-of-type': {
        borderTopLeftRadius: theme.shape.borderRadius,
        borderBottomLeftRadius: theme.shape.borderRadius,
    },
    '&:last-of-type': {
        borderTopRightRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
    },
    '&:not(&[data-selected="true"], :last-of-type)': {
        borderRightWidth: 0,
    },
    '[data-selected="true"] + &': {
        borderLeftWidth: 0,
    },
    '& .MuiChip-label': {
        position: 'relative',
        textAlign: 'center',
        '&::before': {
            content: `'${label}'`,
            fontWeight: 'bold',
            visibility: 'hidden',
            height: 0,
            display: 'block',
            overflow: 'hidden',
            userSelect: 'none',
        },
    },
}));

interface ILifecycleFiltersBaseProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    total?: number;
    children?: ReactNode;
    countData?: Record<LifecycleStage['name'], number>;
    sx?: SxProps<Theme>;
}

const Wrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
}));

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    [theme.breakpoints.down('md')]: {
        flexWrap: 'nowrap',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
    },
}));

const CountBadge = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 0.5),
    minWidth: '1.5em',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    variant: 'outlined',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(-0.5),
    fontWeight: 'bold',
    '&[data-selected="true"]': {
        backgroundColor: theme.palette.secondary.light,
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    },
}));

const lifecycleOptions: {
    label: string;
    value: LifecycleStage['name'] | null;
}[] = [
    { label: 'All lifecycles', value: null },
    { label: 'Develop', value: 'pre-live' },
    { label: 'Rollout production', value: 'live' },
    { label: 'Cleanup', value: 'completed' },
];

export const LifecycleFilters = ({
    state,
    onChange,
    total,
    children,
    countData,
}: ILifecycleFiltersBaseProps) => {
    const current = state.lifecycle?.values ?? [];
    const allFlagsCount = Object.entries(countData ?? {}).reduce(
        (acc, [key, count]) => (key !== 'archived' ? acc + count : acc),
        0,
    );

    return (
        <Wrapper>
            <StyledContainer>
                {lifecycleOptions.map(({ label, value }) => {
                    const isActive =
                        value === null
                            ? !state.lifecycle
                            : current.includes(value);
                    const count = value
                        ? countData?.[value]
                        : allFlagsCount || undefined;

                    const handleClick = () =>
                        onChange(
                            value === null
                                ? { lifecycle: null }
                                : {
                                      lifecycle: {
                                          operator: 'IS',
                                          values: [value],
                                      },
                                  },
                        );

                    return (
                        <StyledChip
                            key={label}
                            label={
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                    }}
                                >
                                    <span>{label}</span>
                                    {count !== undefined && (
                                        <CountBadge>{count}</CountBadge>
                                    )}
                                </Box>
                            }
                            variant='outlined'
                            onClick={handleClick}
                            data-selected={isActive}
                            icon={
                                value ? (
                                    <FeatureLifecycleStageIcon
                                        stage={{ name: value }}
                                    />
                                ) : undefined
                            }
                        />
                    );
                })}
            </StyledContainer>
            {children}
        </Wrapper>
    );
};

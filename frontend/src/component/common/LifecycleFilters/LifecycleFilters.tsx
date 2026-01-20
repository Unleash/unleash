import { Box, styled, useMediaQuery, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import type { FilterItemParamHolder } from '../../filter/Filters/Filters.tsx';
import type { LifecycleStage } from '../../feature/FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage.tsx';
import { FeatureLifecycleStageIcon } from '../FeatureLifecycle/FeatureLifecycleStageIcon.tsx';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu.tsx';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { LifecycleChip } from './LifecycleChip.tsx';
import { FlagsCountBadge } from './FlagsCountBadge.tsx';

interface ILifecycleFiltersBaseProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
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
        flexDirection: 'column',
        alignItems: 'stretch',
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

const MinimalChip = ({
    label,
    value,
    count,
}: {
    label: string;
    value: LifecycleStage['name'] | null;
    count?: number;
}) => (
    <Box
        sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(0.5),
            marginRight: theme.spacing(4),
        })}
    >
        {value && <FeatureLifecycleStageIcon stage={{ name: value }} />}
        <span>{label}</span>
        {count !== undefined && <FlagsCountBadge count={count} />}
    </Box>
);

export const LifecycleFilters = ({
    state,
    onChange,
    children,
    countData,
}: ILifecycleFiltersBaseProps) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const selectedLifecycle = state.lifecycle?.values?.[0] ?? null;

    const isActive = (value: LifecycleStage['name'] | null) => {
        return value === selectedLifecycle;
    };

    const allFlagsCount = Object.entries(countData ?? {}).reduce(
        (acc, [key, count]) => (key !== 'archived' ? acc + count : acc),
        0,
    );

    const getCount = (value: LifecycleStage['name'] | null) =>
        value !== null ? countData?.[value] : allFlagsCount || undefined;

    const applyFilter = (value: LifecycleStage['name'] | null) => {
        onChange(
            value === null
                ? { lifecycle: null }
                : { lifecycle: { operator: 'IS', values: [value] } },
        );
    };

    const selectedOption =
        lifecycleOptions.find((o) => o.value === selectedLifecycle) ??
        lifecycleOptions[0];

    const renderChips = () =>
        lifecycleOptions.map(({ label, value }) => {
            const count =
                value !== null
                    ? countData?.[value]
                    : allFlagsCount || undefined;

            return (
                <LifecycleChip
                    key={label}
                    label={label}
                    flagsCount={count}
                    onClick={() => applyFilter(value)}
                    value={value}
                    isActive={isActive(value)}
                />
            );
        });

    return (
        <>
            {isSmallScreen ? (
                <DropdownMenu
                    id='lifecycle-filters-menu'
                    label=''
                    selected={
                        <MinimalChip
                            label={selectedOption.label}
                            value={selectedOption.value}
                            count={getCount(selectedOption.value)}
                        />
                    }
                    icon={<KeyboardArrowDownOutlined />}
                    renderOptions={() => (
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                width: '100%',
                            }}
                        >
                            {lifecycleOptions.map(({ label, value }) => {
                                const count =
                                    value !== null
                                        ? countData?.[value]
                                        : allFlagsCount || undefined;

                                return (
                                    <LifecycleChip
                                        key={label}
                                        label={label}
                                        flagsCount={count}
                                        onClick={() => applyFilter(value)}
                                        value={value}
                                        isActive={isActive(value)}
                                    />
                                );
                            })}
                            {children}
                        </Box>
                    )}
                    buttonStyle={{
                        border: `1px solid ${theme.palette.divider}`,
                        paddingRight: theme.spacing(2),
                    }}
                    menuSx={{
                        '& .MuiMenu-list': {
                            padding: 0,
                        },
                        '& .MuiPaper-root': {
                            width: '100%',
                        },
                    }}
                />
            ) : (
                <Wrapper>
                    <StyledContainer>{renderChips()}</StyledContainer>
                    {children}
                </Wrapper>
            )}
        </>
    );
};

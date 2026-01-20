import { Box, Chip, styled } from '@mui/material';
import type { LifecycleStage } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage';
import { FeatureLifecycleStageIcon } from '../FeatureLifecycle/FeatureLifecycleStageIcon';
import { FlagsCountBadge } from './FlagsCountBadge';

interface LifecycleChipProps {
    label: string;
    value: LifecycleStage['name'] | null;
    isActive: boolean;
    flagsCount?: number;
    onClick: () => void;
}

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{
    isActive?: boolean;
}>(({ theme }) => ({
    borderRadius: 0,
    padding: theme.spacing(1, 0),
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
    [theme.breakpoints.down('md')]: {
        width: '100%',
        justifyContent: 'flex-start',
        borderLeft: 0,
        borderRight: 0,
        borderBottom: 0,
        borderTop: `1px solid ${theme.palette.divider}`,

        '& .MuiChip-icon': {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },

        '& .MuiChip-label': {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
        },

        '&[data-selected="true"]': {
            borderTop: `1px solid ${theme.palette.divider}`,
            borderBottom: `1px solid ${theme.palette.divider}`,
        },

        '&[data-selected="true"] + &': {
            borderTop: 0,
        },
        '&:not(:has(.MuiChip-icon)) .MuiChip-label': {
            paddingLeft: theme.spacing(8),
        },
        '&:first-of-type': {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        },
        '&:last-of-type': {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        },
    },

    '& .MuiChip-label': {
        position: 'relative',
        textAlign: 'center',
        paddingLeft: theme.spacing(1),
    },
}));

export const LifecycleChip = ({
    label,
    value,
    isActive,
    flagsCount,
    onClick,
}: LifecycleChipProps) => (
    <StyledChip
        label={
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <span>{label}</span>
                {flagsCount !== undefined && (
                    <FlagsCountBadge isActive={isActive} count={flagsCount} />
                )}
            </Box>
        }
        variant='outlined'
        onClick={onClick}
        data-selected={isActive}
        icon={
            value ? (
                <FeatureLifecycleStageIcon stage={{ name: value }} />
            ) : undefined
        }
    />
);

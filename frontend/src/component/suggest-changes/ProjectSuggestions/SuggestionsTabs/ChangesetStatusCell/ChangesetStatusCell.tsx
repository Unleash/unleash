import { Chip, styled } from '@mui/material';
import { colors } from '../../../../../themes/colors';
import { TextCell } from '../../../../common/Table/cells/TextCell/TextCell';
import { Check, CircleOutlined, Close } from '@mui/icons-material';

interface IChangesetStatusCellProps {
    value?: string | null;
}

export enum SuggestChangesetState {
    DRAFT = 'Draft',
    APPROVED = 'Approved',
    IN_REVIEW = 'In review',
    APPLIED = 'Applied',
    CANCELLED = 'Cancelled',
    REJECTED = 'Rejected',
}

export const StyledChip = styled(Chip)(({ theme, icon }) => ({
    padding: theme.spacing(0, 1),
    height: 30,
    borderRadius: theme.shape.borderRadius,
    fontWeight: theme.typography.fontWeightMedium,
    gap: theme.spacing(1, 1),
    ['& .MuiChip-label']: {
        padding: 0,
        paddingLeft: Boolean(icon) ? theme.spacing(0.5) : 0,
    },
}));

export const StyledRejectedChip = styled(StyledChip)(({ theme }) => ({
    border: `1px solid ${theme.palette.error.main}`,
    backgroundColor: colors.red['100'],
    ['& .MuiChip-label']: {
        color: theme.palette.error.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.error.main,
    },
}));

export const StyledApprovedChip = styled(StyledChip)(({ theme }) => ({
    border: `1px solid ${theme.palette.success.main}`,
    backgroundColor: colors.green['100'],
    ['& .MuiChip-label']: {
        color: theme.palette.success.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.success.main,
    },
}));

export const StyledReviewChip = styled(StyledChip)(({ theme }) => ({
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: colors.purple['100'],
    ['& .MuiChip-label']: {
        color: theme.palette.primary.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.primary.main,
    },
}));
export const ChangesetStatusCell = ({ value }: IChangesetStatusCellProps) => {
    const renderState = (state: string) => {
        switch (state) {
            case SuggestChangesetState.IN_REVIEW:
                return (
                    <StyledReviewChip
                        label={'Review required'}
                        icon={<CircleOutlined fontSize={'small'} />}
                    />
                );
            case SuggestChangesetState.APPROVED:
                return (
                    <StyledApprovedChip
                        label={'Approved'}
                        icon={<Check fontSize={'small'} />}
                    />
                );
            case SuggestChangesetState.APPLIED:
                return (
                    <StyledApprovedChip
                        label={'Applied'}
                        icon={<Check fontSize={'small'} />}
                    />
                );
            case SuggestChangesetState.CANCELLED:
                return (
                    <StyledRejectedChip
                        label={'Cancelled'}
                        icon={<Close fontSize={'small'} sx={{ mr: 8 }} />}
                    />
                );
            case SuggestChangesetState.REJECTED:
                return (
                    <StyledRejectedChip
                        label={'Rejected'}
                        icon={<Close fontSize={'small'} sx={{ mr: 8 }} />}
                    />
                );
            default:
                return null;
        }
    };

    if (!value) {
        return <TextCell />;
    }

    return <TextCell>{renderState(value)}</TextCell>;
};

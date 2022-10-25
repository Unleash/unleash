import { UserAvatar } from '../../../common/UserAvatar/UserAvatar';
import { Chip, styled } from '@mui/material';
import { colors } from '../../../../themes/colors';
import { TextCell } from '../../../common/Table/cells/TextCell/TextCell';

interface IChangesetStatusCellProps {
    value?: string | null;
}

enum ChangesetState {
    DRAFT = 'Draft',
    REVIEW = 'Review',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export const StyledChip = styled(Chip)(({ theme, icon }) => ({
    padding: theme.spacing(0, 1),
    height: 24,
    borderRadius: theme.shape.borderRadius,
    fontWeight: theme.typography.fontWeightMedium,
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
        if (state === 'Review') {
            return <StyledReviewChip label={'Review required'} />;
        }

        if (state === 'Approved') {
            return <StyledApprovedChip label={'Approved'} />;
        }

        if (state === 'Rejected') {
            return <StyledRejectedChip label={'Rejected'} />;
        }
    };

    if (!value) {
        return <TextCell />;
    }

    return <TextCell>{renderState(value)}</TextCell>;
};

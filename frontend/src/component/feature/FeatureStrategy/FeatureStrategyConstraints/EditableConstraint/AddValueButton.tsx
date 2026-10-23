import Add from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/ReportProblemOutlined';
import { Button, styled } from '@mui/material';
import { forwardRef } from 'react';

type Props = {
    hasValues: boolean;
    onClick: () => void;
};

const StyledButton = styled(Button)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
    padding: theme.spacing(0, 1),
    minWidth: 'auto',
    borderRadius: theme.shape.borderRadiusSmall,
    color: theme.palette.warning.dark,
    '&:hover': {
        backgroundColor: theme.palette.warning.container,
    },
    '&[data-has-values="true"]': {
        color: theme.palette.primary.main,
    },
    '&[data-has-values="true"]:hover': {
        backgroundColor: theme.palette.primary.container,
    },
}));

const Content = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    lineHeight: 1,
    borderBottom: `1px dashed ${theme.palette.warning.dark}`,
    '[data-has-values="true"] &': {
        borderBottom: 'none',
    },
}));

export const AddValueButton = forwardRef<HTMLButtonElement, Props>(
    ({ hasValues, onClick }, ref) => (
        <StyledButton
            ref={ref}
            data-has-values={hasValues}
            variant='text'
            size='medium'
            onClick={onClick}
            data-testid='CONSTRAINT_ADD_VALUES_BUTTON'
        >
            <Content>
                {hasValues ? (
                    <Add sx={{ fontSize: 14 }} />
                ) : (
                    <WarningIcon sx={{ fontSize: 14 }} />
                )}
                Add value
            </Content>
        </StyledButton>
    ),
);

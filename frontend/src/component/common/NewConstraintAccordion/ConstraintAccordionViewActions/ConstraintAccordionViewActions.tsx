import type React from 'react';
import { Button, styled, Tooltip } from '@mui/material';
import { ConditionallyRender } from '../../ConditionallyRender/ConditionallyRender.tsx';

interface ConstraintAccordionHeaderActionsProps {
    onUse?: () => void;
}

const StyledHeaderActions = styled('div')(({ theme }) => ({
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
}));

export const ConstraintAccordionViewActions = ({
    onUse,
}: ConstraintAccordionHeaderActionsProps) => {
    const onUseClick =
        onUse &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onUse();
        });

    return (
        <StyledHeaderActions>
            <ConditionallyRender
                condition={Boolean(onUseClick)}
                show={
                    <Tooltip title='Use constraint' arrow>
                        <StyledButton
                            variant='text'
                            color='primary'
                            onClick={onUseClick}
                            data-testid='USE_CONSTRAINT_BUTTON'
                        >
                            Use this
                        </StyledButton>
                    </Tooltip>
                }
            />
        </StyledHeaderActions>
    );
};

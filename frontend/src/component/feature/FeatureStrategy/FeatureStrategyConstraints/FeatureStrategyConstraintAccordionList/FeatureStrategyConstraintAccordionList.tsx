import React, { forwardRef, RefObject } from 'react';
import { Box, Button, styled, Tooltip, Typography } from '@mui/material';
import { Add, HelpOutline } from '@mui/icons-material';
import { IConstraint } from 'interfaces/strategy';

import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import {
    IConstraintAccordionListRef,
    useConstraintAccordionList,
} from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { NewConstraintAccordionList } from 'component/common/NewConstraintAccordion/NewConstraintAccordionList/NewConstraintAccordionList';

interface IConstraintAccordionListProps {
    constraints: IConstraint[];
    setConstraints?: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    showCreateButton?: boolean;
    /* Add "constraints" title on the top - default `true` */
    showLabel?: boolean;
}

export const constraintAccordionListId = 'constraintAccordionListId';

const StyledContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
});

const StyledHelpWrapper = styled(Tooltip)(({ theme }) => ({
    marginLeft: theme.spacing(0.75),
    height: theme.spacing(1.5),
}));

const StyledHelp = styled(HelpOutline)(({ theme }) => ({
    fill: theme.palette.action.active,
    [theme.breakpoints.down(860)]: {
        display: 'none',
    },
}));

const StyledConstraintLabel = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
}));

const StyledAddCustomLabel = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    display: 'flex',
}));

const StyledHelpIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

export const FeatureStrategyConstraintAccordionList = forwardRef<
    IConstraintAccordionListRef | undefined,
    IConstraintAccordionListProps
>(
    (
        { constraints, setConstraints, showCreateButton, showLabel = true },
        ref,
    ) => {
        const { onAdd, state, context } = useConstraintAccordionList(
            setConstraints,
            ref as RefObject<IConstraintAccordionListRef>,
        );

        if (context.length === 0) {
            return null;
        }

        return (
            <StyledContainer id={constraintAccordionListId}>
                <ConditionallyRender
                    condition={Boolean(showCreateButton && onAdd)}
                    show={
                        <div>
                            <StyledHelpIconBox>
                                <Typography>Constraints</Typography>
                                <HelpIcon
                                    htmlTooltip
                                    tooltip={
                                        <Box>
                                            <Typography variant='body2'>
                                                Constraints are advanced
                                                targeting rules that you can use
                                                to enable a feature toggle for a
                                                subset of your users. Read more
                                                about constraints{' '}
                                                <a
                                                    href='https://docs.getunleash.io/reference/strategy-constraints'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                >
                                                    here
                                                </a>
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </StyledHelpIconBox>
                            <NewConstraintAccordionList
                                ref={ref}
                                setConstraints={setConstraints}
                                constraints={constraints}
                                state={state}
                            />
                            <Button
                                sx={{ marginTop: '1rem' }}
                                type='button'
                                onClick={onAdd}
                                startIcon={<Add />}
                                variant='outlined'
                                color='primary'
                                data-testid='ADD_CONSTRAINT_BUTTON'
                            >
                                Add constraint
                            </Button>
                        </div>
                    }
                />
            </StyledContainer>
        );
    },
);

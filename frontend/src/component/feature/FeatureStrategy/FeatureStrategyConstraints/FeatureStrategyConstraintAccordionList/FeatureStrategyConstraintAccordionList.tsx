import type React from 'react';
import { forwardRef, type RefObject } from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import type { IConstraint } from 'interfaces/strategy';

import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import {
    type IConstraintAccordionListRef,
    useConstraintAccordionList,
} from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { NewConstraintAccordionList } from 'component/common/NewConstraintAccordion/NewConstraintAccordionList/NewConstraintAccordionList';
import { Limit } from 'component/common/Limit/Limit';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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

const StyledHelpIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const useConstraintLimit = (constraintsCount: number) => {
    const { uiConfig } = useUiConfig();
    const constraintsLimit = uiConfig.resourceLimits?.constraints || 30;
    const limitReached = constraintsCount >= constraintsLimit;

    return {
        limit: constraintsLimit,
        limitReached,
    };
};

export const FeatureStrategyConstraintAccordionList = forwardRef<
    IConstraintAccordionListRef | undefined,
    IConstraintAccordionListProps
>(({ constraints, setConstraints, showCreateButton }, ref) => {
    const { onAdd, state, context } = useConstraintAccordionList(
        setConstraints,
        ref as RefObject<IConstraintAccordionListRef>,
    );
    const { limit, limitReached } = useConstraintLimit(constraints.length);

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
                                            Constraints are advanced targeting
                                            rules that you can use to enable a
                                            feature flag for a subset of your
                                            users. Read more about constraints{' '}
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

                        <Box
                            sx={(theme) => ({
                                marginTop: theme.spacing(2),
                                marginBottom: theme.spacing(2),
                            })}
                        >
                            <Limit
                                name='constraints in this strategy'
                                shortName='constraints'
                                currentValue={constraints.length}
                                limit={limit}
                            />
                        </Box>

                        <Button
                            type='button'
                            onClick={onAdd}
                            startIcon={<Add />}
                            variant='outlined'
                            color='primary'
                            data-testid='ADD_CONSTRAINT_BUTTON'
                            disabled={Boolean(limitReached)}
                        >
                            Add constraint
                        </Button>
                    </div>
                }
            />
        </StyledContainer>
    );
});

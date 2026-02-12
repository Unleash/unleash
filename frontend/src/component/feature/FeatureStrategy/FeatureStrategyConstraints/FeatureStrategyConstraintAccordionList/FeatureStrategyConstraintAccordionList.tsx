import type React from 'react';
import { forwardRef, useImperativeHandle, type RefObject } from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import type { IConstraint } from 'interfaces/strategy';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { EditableConstraintsList } from 'component/common/NewConstraintAccordion/ConstraintsList/EditableConstraintsList';
import { Limit } from 'component/common/Limit/Limit';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { RecentlyUsedConstraints } from '../RecentlyUsedConstraints/RecentlyUsedConstraints.tsx';
import { useWeakMap } from 'hooks/useWeakMap.ts';
import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext.ts';
import { createEmptyConstraint } from 'utils/createEmptyConstraint.ts';

interface IConstraintAccordionListProps {
    constraints: IConstraint[];
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
}

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

interface IConstraintAccordionListRef {
    addConstraint?: (contextName: string) => void;
}

interface IConstraintAccordionListItemState {
    // Is the constraint new (never been saved)?
    new?: boolean;
    // Is the constraint currently being edited?
    editing?: boolean;
}

const useConstraintAccordionList = (
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>,
    ref: React.RefObject<IConstraintAccordionListRef>,
) => {
    const state = useWeakMap<IConstraint, IConstraintAccordionListItemState>();
    const { context } = useAssignableUnleashContext();

    const addConstraint = (contextName: string) => {
        const constraint = createEmptyConstraint(contextName);
        state.set(constraint, { editing: true, new: true });
        setConstraints((prev) => [...prev, constraint]);
    };

    useImperativeHandle(ref, () => ({
        addConstraint,
    }));

    const onAdd =
        addConstraint &&
        (() => {
            addConstraint(context[0].name);
        });

    return { onAdd, state, context };
};

export const FeatureStrategyConstraintAccordionList = forwardRef<
    IConstraintAccordionListRef | undefined,
    IConstraintAccordionListProps
>(({ constraints, setConstraints }, ref) => {
    const { onAdd, context } = useConstraintAccordionList(
        setConstraints,
        ref as RefObject<IConstraintAccordionListRef>,
    );
    const { limit, limitReached } = useConstraintLimit(constraints.length);

    if (context.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <div>
                <StyledHelpIconBox>
                    <Typography>Constraints</Typography>
                    <HelpIcon
                        htmlTooltip
                        tooltip={
                            <Box>
                                <Typography variant='body2'>
                                    Constraints are advanced targeting rules
                                    that you can use to enable a feature flag
                                    for a subset of your users. Read more about
                                    constraints{' '}
                                    <a
                                        href='https://docs.getunleash.io/concepts/activation-strategies#constraints'
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
                {setConstraints ? (
                    <EditableConstraintsList
                        ref={ref}
                        setConstraints={setConstraints}
                        constraints={constraints}
                    />
                ) : null}
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
                <RecentlyUsedConstraints
                    setConstraints={setConstraints}
                    constraints={constraints}
                />
            </div>
        </StyledContainer>
    );
});

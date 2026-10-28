import type React from 'react';
import {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    type RefObject,
} from 'react';
import { Box, Button, styled, Typography, useTheme } from '@mui/material';
import Add from '@mui/icons-material/Add';
import type { IConstraint } from 'interfaces/strategy';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { EditableConstraintsList } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint/EditableConstraintsList.tsx';
import { Limit } from 'component/common/Limit/Limit';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useWeakMap } from 'hooks/useWeakMap.ts';
import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext.ts';
import { createEmptyConstraint } from 'utils/createEmptyConstraint.ts';
import { SelectPopover } from 'component/common/SelectPopover/SelectPopover.tsx';
import { createContextFieldOptions } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint/createContextFieldOptions.ts';

interface IConstraintAccordionListProps {
    constraints: IConstraint[];
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
}

const StyledContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
});

const StyledRow = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
});

const StyledTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    fontSize: 'inherit',
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
}));

const StyledHelpIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const StyledLimitBox = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '&:empty': {
        display: 'none',
    },
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
    ref: React.RefObject<IConstraintAccordionListRef | null>,
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

    return { addConstraint, state, context };
};

export const FeatureStrategyConstraintAccordionList = forwardRef<
    IConstraintAccordionListRef | undefined,
    IConstraintAccordionListProps
>(({ constraints, setConstraints }, ref) => {
    const theme = useTheme();
    const { addConstraint, context } = useConstraintAccordionList(
        setConstraints,
        ref as RefObject<IConstraintAccordionListRef | null>,
    );
    const { limit, limitReached } = useConstraintLimit(constraints.length);
    const addConstraintButtonRef = useRef<HTMLButtonElement>(null);
    const [addConstraintAnchor, setAddConstraintAnchor] =
        useState<HTMLButtonElement | null>(null);

    if (context.length === 0) {
        return null;
    }

    const contextFieldOptions = createContextFieldOptions(context);

    return (
        <StyledContainer>
            <StyledRow>
                <StyledHelpIconBox>
                    <StyledTitle>Constraints</StyledTitle>
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
                <Button
                    ref={addConstraintButtonRef}
                    type='button'
                    onClick={() =>
                        setAddConstraintAnchor(addConstraintButtonRef.current)
                    }
                    startIcon={<Add />}
                    variant='outlined'
                    color='primary'
                    size='medium'
                    data-testid='ADD_CONSTRAINT_BUTTON'
                    disabled={Boolean(limitReached)}
                >
                    Add constraint
                </Button>
                <SelectPopover
                    open={Boolean(addConstraintAnchor)}
                    anchorEl={addConstraintAnchor}
                    onClose={() => setAddConstraintAnchor(null)}
                    optionGroups={contextFieldOptions}
                    onChange={(contextName) => {
                        if (contextName) {
                            addConstraint(contextName);
                        }
                    }}
                    searchPlaceholderText='Search context fields'
                    horizontalAlign='right'
                    listMaxHeight={theme.spacing(45)}
                />
            </StyledRow>
            {setConstraints ? (
                <EditableConstraintsList
                    ref={ref}
                    setConstraints={setConstraints}
                    constraints={constraints}
                />
            ) : null}
            <StyledLimitBox>
                <Limit
                    name='constraints in this strategy'
                    shortName='constraints'
                    currentValue={constraints.length}
                    limit={limit}
                />
            </StyledLimitBox>
        </StyledContainer>
    );
});

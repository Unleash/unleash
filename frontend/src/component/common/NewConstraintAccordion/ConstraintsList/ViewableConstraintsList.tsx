import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { constraintId } from 'component/common/LegacyConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { ConstraintAccordionView } from 'component/common/NewConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';

export interface IViewableConstraintsListProps {
    constraints: IConstraint[];
}

export const viewableConstraintsListId = 'viewableConstraintsListId';

const StyledContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
});

export const ViewableConstraintsList = ({
    constraints,
}: IViewableConstraintsListProps) => {
    const { context } = useUnleashContext();

    if (context.length === 0) {
        return null;
    }

    return (
        <StyledContainer id={viewableConstraintsListId}>
            <ConstraintsList>
                {constraints.map((constraint, index) => (
                    <ConstraintAccordionView
                        key={constraint[constraintId]}
                        constraint={constraint}
                    />
                ))}
            </ConstraintsList>
        </StyledContainer>
    );
};

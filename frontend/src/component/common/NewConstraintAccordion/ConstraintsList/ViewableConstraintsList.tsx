import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { ConstraintAccordionView } from 'component/common/NewConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';
import { constraintId } from 'constants/constraintId';
import { objectId } from 'utils/objectId';

export interface IViewableConstraintsListProps {
    constraints: IConstraint[];
}

const StyledContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
});

export const ViewableConstraintsList = ({
    constraints,
}: IViewableConstraintsListProps) => {
    const { context } = useAssignableUnleashContext();

    if (context.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <ConstraintsList>
                {constraints.map((constraint) => (
                    <ConstraintAccordionView
                        key={constraint[constraintId] || objectId(constraint)}
                        constraint={constraint}
                    />
                ))}
            </ConstraintsList>
        </StyledContainer>
    );
};

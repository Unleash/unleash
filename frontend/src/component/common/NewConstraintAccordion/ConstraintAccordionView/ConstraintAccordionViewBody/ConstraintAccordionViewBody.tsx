import type { IConstraint } from 'interfaces/strategy';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { MultipleValues } from './MultipleValues/MultipleValues.tsx';
import { SingleValue } from './SingleValue/SingleValue.tsx';
import { styled } from '@mui/material';

interface IConstraintAccordionViewBodyProps {
    constraint: IConstraint;
}

const StyledValueContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(1, 0),
    maxHeight: '400px',
    overflowY: 'auto',
}));

export const ConstraintAccordionViewBody = ({
    constraint,
}: IConstraintAccordionViewBodyProps) => {
    const { locationSettings } = useLocationSettings();

    return (
        <div>
            <StyledValueContainer>
                <MultipleValues values={constraint.values} />
                <SingleValue
                    value={formatConstraintValue(constraint, locationSettings)}
                    operator={constraint.operator}
                />
            </StyledValueContainer>
        </div>
    );
};

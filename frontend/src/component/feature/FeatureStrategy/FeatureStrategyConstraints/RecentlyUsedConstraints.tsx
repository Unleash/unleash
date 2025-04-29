import type { IConstraint } from 'interfaces/strategy';
import { styled, Typography } from '@mui/material';
import { ConstraintAccordionView } from 'component/common/NewConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';
import { constraintId } from 'component/common/LegacyConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';

type IRecentlyUsedConstraintsProps = {
    temporary?: string;
};

const StyledContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledConstraintsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const RecentlyUsedConstraints = ({
    temporary,
}: IRecentlyUsedConstraintsProps) => {
    // Mock constraint for now
    const mockConstraints: IConstraint[] = [
        {
            contextName: 'userId',
            operator: 'IN',
            values: ['123', '456', '789'],
            value: '',
        },
        {
            contextName: 'environment',
            operator: 'STR_CONTAINS',
            values: ['production'],
            value: '',
        },
    ];

    return (
        <StyledContainer>
            <StyledHeader>Recently used constraints</StyledHeader>
            <StyledConstraintsContainer>
                {mockConstraints.map((constraint) => (
                    <ConstraintAccordionView
                        key={constraint[constraintId]}
                        constraint={constraint}
                    />
                ))}
            </StyledConstraintsContainer>
        </StyledContainer>
    );
};

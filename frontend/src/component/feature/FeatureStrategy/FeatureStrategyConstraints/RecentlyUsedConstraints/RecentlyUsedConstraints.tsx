import { styled, Typography } from '@mui/material';
import { ConstraintAccordionView } from 'component/common/NewConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';
import { constraintId } from 'component/common/LegacyConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { useRecentlyUsedConstraints } from './useRecentlyUsedConstraints';
import type { IConstraint } from 'interfaces/strategy';

type IRecentlyUsedConstraintsProps = {
    setConstraints?: React.Dispatch<React.SetStateAction<IConstraint[]>>;
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
    setConstraints,
}: IRecentlyUsedConstraintsProps) => {
    const { items: recentlyUsedConstraints } = useRecentlyUsedConstraints();

    if (recentlyUsedConstraints.length === 0 || !setConstraints) {
        return null;
    }

    return (
        <StyledContainer>
            <StyledHeader>Recently used constraints</StyledHeader>
            <StyledConstraintsContainer>
                {recentlyUsedConstraints.map((constraint) => (
                    <ConstraintAccordionView
                        key={constraint[constraintId]}
                        constraint={constraint}
                        borderStyle='dashed'
                        onUse={() => {
                            setConstraints((prev) => [...prev, constraint]);
                        }}
                    />
                ))}
            </StyledConstraintsContainer>
        </StyledContainer>
    );
};

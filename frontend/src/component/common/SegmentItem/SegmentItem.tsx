import { useMemo, useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import type { ISegment } from 'interfaces/segment';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    styled,
} from '@mui/material';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import { ConstraintItem } from 'component/common/ConstraintsList/ConstraintItem/ConstraintItem';
import { objectId } from 'utils/objectId';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';

type SegmentItemProps = {
    segment: Partial<ISegment>;
    isExpanded?: boolean;
    disabled?: boolean | null;
    constraintList?: JSX.Element;
    headerContent?: JSX.Element;
};

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    margin: 0,
    padding: 0,
    '::before': {
        // MUI separator between accordions
        display: 'none',
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    padding: 0,
    fontSize: theme.typography.body2.fontSize,
    minHeight: 'unset',
    '.MuiAccordionSummary-content, .MuiAccordionSummary-content.Mui-expanded': {
        margin: 0,
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2, 0, 1),
}));

const StyledLink = styled(Link)({
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
});

const StyledActionsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    marginTop: theme.spacing(-0.5),
    marginBottom: theme.spacing(-0.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
}));

const StyledNoConstraintsText = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

export const SegmentItem: FC<SegmentItemProps> = ({
    segment,
    isExpanded,
    headerContent,
    constraintList,
}) => {
    const [isOpen, setIsOpen] = useState(isExpanded || false);

    const constraints = useMemo(() => {
        if (constraintList) {
            return constraintList;
        }

        if (segment.constraints?.length) {
            return (
                <ConstraintsList>
                    {segment.constraints.map((constraint, index) => (
                        <ConstraintItem
                            key={`${objectId(constraint)}-${index}`}
                            {...constraint}
                        />
                    ))}
                </ConstraintsList>
            );
        }

        return (
            <StyledNoConstraintsText>
                This segment has no constraints.
            </StyledNoConstraintsText>
        );
    }, [constraintList, segment.constraints]);

    return (
        <StyledAccordion expanded={isOpen} disableGutters>
            <StyledAccordionSummary id={`segment-accordion-${segment.id}`}>
                <StrategyEvaluationItem type='Segment'>
                    <StyledLink to={`/segments/edit/${segment.id}`}>
                        {segment.name}
                    </StyledLink>
                </StrategyEvaluationItem>
                {headerContent ? headerContent : null}
                {!isExpanded ? (
                    <StyledActionsContainer>
                        <StyledButton
                            size='small'
                            variant='outlined'
                            onClick={() => setIsOpen((value) => !value)}
                        >
                            {isOpen ? 'Close preview' : 'Preview'}
                        </StyledButton>
                    </StyledActionsContainer>
                ) : null}
            </StyledAccordionSummary>
            <StyledAccordionDetails>{constraints}</StyledAccordionDetails>
        </StyledAccordion>
    );
};

import { useId, useMemo, useState, type FC } from 'react';
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
import { objectId } from 'utils/objectId';
import {
    ConstraintListItem,
    ConstraintsList,
} from 'component/common/ConstraintsList/ConstraintsList';
import { ConstraintAccordionView } from '../NewConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView.tsx';

type SegmentItemProps = {
    segment: Partial<ISegment>;
    isExpanded?: boolean;
    disabled?: boolean | null;
    constraintList?: JSX.Element;
    headerContent?: JSX.Element;
};

const StyledConstraintListItem = styled(ConstraintListItem)(() => ({
    padding: 0,
}));

const StyledAccordion = styled(Accordion)(() => ({
    boxShadow: 'none',
    margin: 0,
    padding: 0,
    '::before': {
        // MUI separator between accordions
        display: 'none',
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    minHeight: 'unset',
    ':focus-within': {
        backgroundColor: 'inherit',
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(0.5, 3, 2.5),
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    paddingRight: theme.spacing(0.5),
    '&:hover': {
        textDecoration: 'underline',
    },
}));

const StyledActionsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
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
    const segmentDetailsId = useId();

    const constraints = useMemo(() => {
        if (constraintList) {
            return constraintList;
        }

        if (segment.constraints?.length) {
            return (
                <ConstraintsList>
                    {segment.constraints.map((constraint, index) => (
                        <ConstraintAccordionView
                            key={`${objectId(constraint)}-${index}`}
                            constraint={constraint}
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
        <StyledConstraintListItem>
            <StyledAccordion
                expanded={isOpen}
                disableGutters
                TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
            >
                <StyledAccordionSummary
                    id={`segment-accordion-${segment.id}`}
                    tabIndex={-1}
                    aria-controls={segmentDetailsId}
                >
                    <StrategyEvaluationItem type='Segment'>
                        <StyledLink to={`/segments/edit/${segment.id}`}>
                            {segment.name}
                        </StyledLink>
                    </StrategyEvaluationItem>
                    {headerContent ? headerContent : null}
                    {!isExpanded ? (
                        <StyledActionsContainer>
                            <StyledButton
                                aria-controls={segmentDetailsId}
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
        </StyledConstraintListItem>
    );
};

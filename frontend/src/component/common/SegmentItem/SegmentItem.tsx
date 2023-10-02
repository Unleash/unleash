import { useState, VFC } from 'react';
import { Link } from 'react-router-dom';
import { DonutLarge } from '@mui/icons-material';
import { ISegment } from 'interfaces/segment';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    styled,
    Typography,
} from '@mui/material';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface ISegmentItemProps {
    segment: Partial<ISegment>;
    isExpanded?: boolean;
    constraintList?: JSX.Element;
    headerContent?: JSX.Element;
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.paper,
    boxShadow: 'none',
    margin: 0,
    transition: 'all 0.1s ease',
    '&:before': {
        opacity: '0 !important',
    },
    '&.Mui-expanded': { backgroundColor: theme.palette.neutral.light },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    margin: theme.spacing(0, 0.5),
    fontSize: theme.typography.body2.fontSize,
    '.MuiAccordionSummary-content': {
        display: 'flex',
        alignItems: 'center',
    },
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    marginLeft: theme.spacing(1),
    '&:hover': {
        textDecoration: 'underline',
    },
}));

export const SegmentItem: VFC<ISegmentItemProps> = ({
    segment,
    isExpanded,
    headerContent,
    constraintList,
}) => {
    const [isOpen, setIsOpen] = useState(isExpanded || false);

    return (
        <StyledAccordion expanded={isOpen}>
            <StyledAccordionSummary id={`segment-accordion-${segment.id}`}>
                <DonutLarge color="secondary" sx={{ mr: 1 }} />
                <span>Segment:</span>
                <StyledLink to={`/segments/edit/${segment.id}`}>
                    {segment.name}
                </StyledLink>
                <ConditionallyRender
                    condition={Boolean(headerContent)}
                    show={headerContent}
                />
                <ConditionallyRender
                    condition={!isExpanded}
                    show={
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setIsOpen(value => !value)}
                            sx={{
                                my: 0,
                                ml: 'auto',
                                fontSize: theme =>
                                    theme.typography.body2.fontSize,
                            }}
                        >
                            {isOpen ? 'Close preview' : 'Preview'}
                        </Button>
                    }
                />
            </StyledAccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
                <ConditionallyRender
                    condition={Boolean(constraintList)}
                    show={constraintList}
                    elseShow={
                        <ConditionallyRender
                            condition={(segment?.constraints?.length || 0) > 0}
                            show={
                                <ConstraintAccordionList
                                    constraints={segment!.constraints!}
                                    showLabel={false}
                                />
                            }
                            elseShow={
                                <Typography>
                                    This segment has no constraints.
                                </Typography>
                            }
                        />
                    }
                />
            </AccordionDetails>
        </StyledAccordion>
    );
};

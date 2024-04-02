import { useState, type VFC } from 'react';
import { Link } from 'react-router-dom';
import DonutLarge from '@mui/icons-material/DonutLarge';
import type { ISegment } from 'interfaces/segment';
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
    disabled?: boolean | null;
    constraintList?: JSX.Element;
    headerContent?: JSX.Element;
}

const StyledAccordion = styled(Accordion, {
    shouldForwardProp: (prop) => prop !== 'isDisabled',
})<{ isDisabled: boolean | null }>(({ theme, isDisabled }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&.segment-accordion': {
        borderRadius: theme.shape.borderRadiusMedium,
    },
    boxShadow: 'none',
    margin: 0,
    transition: 'all 0.1s ease',
    '&:before': {
        opacity: '0 !important',
    },
    '&.Mui-expanded': { backgroundColor: theme.palette.neutral.light },
    backgroundColor: isDisabled
        ? theme.palette.envAccordion.disabled
        : theme.palette.background.paper,
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
const StyledText = styled('span', {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled: boolean | null }>(({ theme, disabled }) => ({
    color: disabled ? theme.palette.text.secondary : 'inherit',
}));

export const SegmentItem: VFC<ISegmentItemProps> = ({
    segment,
    isExpanded,
    headerContent,
    constraintList,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(isExpanded || false);

    return (
        <StyledAccordion
            className='segment-accordion'
            isDisabled={disabled}
            expanded={isOpen}
        >
            <StyledAccordionSummary id={`segment-accordion-${segment.id}`}>
                <DonutLarge
                    sx={(theme) => ({
                        mr: 1,
                        color: disabled
                            ? theme.palette.neutral.border
                            : theme.palette.secondary.main,
                    })}
                />
                <StyledText disabled={disabled}>Segment:</StyledText>
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
                            size='small'
                            variant='outlined'
                            onClick={() => setIsOpen((value) => !value)}
                            sx={{
                                my: 0,
                                ml: 'auto',
                                fontSize: (theme) =>
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

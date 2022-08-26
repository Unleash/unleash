import { useState, VFC } from 'react';
import { Link } from 'react-router-dom';
import { DonutLarge } from '@mui/icons-material';
import { ISegment } from 'interfaces/segment';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Typography,
} from '@mui/material';
import { ConstraintAccordionList } from '../ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { useStyles } from './SegmentItem.styles';

interface ISegmentItemProps {
    segment: Partial<ISegment>;
    isExpanded?: boolean;
    constraintList?: JSX.Element;
    headerContent?: JSX.Element;
}

export const SegmentItem: VFC<ISegmentItemProps> = ({
    segment,
    isExpanded,
    headerContent,
    constraintList,
}) => {
    const { classes } = useStyles();
    const [isOpen, setIsOpen] = useState(isExpanded || false);

    return (
        <Accordion
            expanded={isOpen}
            className={classes.accordion}
            classes={{
                root: classes.accordionRoot,
                expanded: classes.accordionExpanded,
            }}
        >
            <AccordionSummary
                id={`segment-accordion-${segment.id}`}
                className={classes.summary}
            >
                <DonutLarge color="secondary" sx={{ mr: 1 }} />
                Segment:
                <Link
                    to={`/segments/edit/${segment.id}`}
                    className={classes.link}
                >
                    {segment.name}
                </Link>
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
                            className={classes.previewButton}
                        >
                            {isOpen ? 'Close preview' : 'Preview'}
                        </Button>
                    }
                />
            </AccordionSummary>
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
        </Accordion>
    );
};

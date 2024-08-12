import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { FeatureNamingType } from 'interfaces/project';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledFlagNamingInfo = styled('article')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    borderRadius: theme.shape.borderRadius,
    marginInlineStart: theme.spacing(1.5),
    backgroundColor: `${theme.palette.background.elevation2}`,
    dl: {
        display: 'grid',
        gridTemplateColumns: 'max-content auto',
        rowGap: theme.spacing(1),
        columnGap: 0,
    },
    dt: {
        color: theme.palette.text.secondary,
        '&::after': { content: '":"' },
    },
    dd: {
        marginInlineStart: theme.spacing(2),
    },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    backgroundColor: 'inherit',
    boxShadow: 'none',
    margin: 0,
}));

type Props = {
    naming: FeatureNamingType;
};

export const NamingPatternInfo: React.FC<Props> = ({ naming }) => {
    const controlId = 'naming-pattern-info-summary';
    return (
        <StyledFlagNamingInfo>
            <StyledAccordion>
                <AccordionSummary
                    id={controlId}
                    aria-controls={controlId}
                    expandIcon={<ExpandMoreIcon />}
                >
                    Name must match:&nbsp;<code>^{naming.pattern}$</code>
                </AccordionSummary>
                <AccordionDetails>
                    <p>The name must match this pattern:</p>
                    <dl id='naming-pattern-info'>
                        <dt>Pattern</dt>
                        <dd>
                            <code>^{naming.pattern}$</code>
                        </dd>
                        <ConditionallyRender
                            condition={Boolean(naming?.example)}
                            show={
                                <>
                                    <dt>Example</dt>
                                    <dd>{naming?.example}</dd>
                                </>
                            }
                        />
                        <ConditionallyRender
                            condition={Boolean(naming?.description)}
                            show={
                                <>
                                    <dt>Description</dt>
                                    <dd>{naming?.description}</dd>
                                </>
                            }
                        />
                    </dl>
                </AccordionDetails>
            </StyledAccordion>
        </StyledFlagNamingInfo>
    );
};

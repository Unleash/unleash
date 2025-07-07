import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { CreateFeatureNamingPatternSchema } from 'openapi';

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

const BreakableCode = styled('code')({
    overflowWrap: 'anywhere',
});

type Props = {
    naming: CreateFeatureNamingPatternSchema;
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
                    Name must match:&nbsp;
                    <BreakableCode>^{naming.pattern}$</BreakableCode>
                </AccordionSummary>
                <AccordionDetails>
                    <p>The name must match this pattern:</p>
                    <dl id='naming-pattern-info'>
                        <dt>Pattern</dt>
                        <dd>
                            <BreakableCode>^{naming.pattern}$</BreakableCode>
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

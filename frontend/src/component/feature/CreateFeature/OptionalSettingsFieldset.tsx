import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
    Switch,
    type Theme,
    useTheme,
} from '@mui/material';
import { useId } from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { Section } from './CreateFeatureForm.styles.ts';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    overflow: 'hidden',
    boxShadow: theme.boxShadows.elevated,
}));

const accordionSummarySlotProps = (theme: Theme) => ({
    root: {
        sx: {
            minHeight: theme.spacing(6),
            '&.Mui-expanded': {
                minHeight: theme.spacing(6),
            },
        },
    },
    content: {
        sx: {
            justifyContent: 'space-between',
            alignItems: 'center',
            marginRight: theme.spacing(1.5),
        },
    },
});

const StyledAccordionHeading = styled('h2')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledAccordionHint = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    '.Mui-expanded &': {
        display: 'none',
    },
}));

const StyledBody = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    alignItems: 'center',
    columnGap: theme.spacing(3),
    rowGap: theme.spacing(2),
}));

const StyledFieldLabel = styled('label')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
}));

const StyledImpressionDataRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

type OptionalSettingsFieldsetProps = {
    impressionData: boolean;
    onImpressionDataChange: (enabled: boolean) => void;
};

export const OptionalSettingsFieldset = ({
    impressionData,
    onImpressionDataChange,
}: OptionalSettingsFieldsetProps) => {
    const theme = useTheme();
    const switchId = useId();

    return (
        <Section>
            <StyledAccordion defaultExpanded={impressionData}>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    slotProps={accordionSummarySlotProps(theme)}
                >
                    <StyledAccordionHeading>
                        Other optional settings
                    </StyledAccordionHeading>
                    <StyledAccordionHint>
                        {impressionData
                            ? 'Impression data enabled'
                            : 'You can change these later'}
                    </StyledAccordionHint>
                </AccordionSummary>
                <AccordionDetails>
                    <StyledBody>
                        <StyledFieldLabel htmlFor={switchId}>
                            Impression data
                        </StyledFieldLabel>
                        <StyledImpressionDataRow>
                            <Switch
                                id={switchId}
                                checked={impressionData}
                                onChange={(event) =>
                                    onImpressionDataChange(event.target.checked)
                                }
                            />
                            <span>
                                {impressionData
                                    ? 'Impression data enabled'
                                    : 'Impression data not enabled'}
                            </span>
                            <HelpIcon
                                tooltip={
                                    <>
                                        Impression data is used to track how
                                        your flag is performing. When enabled,
                                        you can subscribe to 'impression events'
                                        in the SDK and process them according to
                                        your needs.
                                    </>
                                }
                                htmlTooltip
                            />
                        </StyledImpressionDataRow>
                    </StyledBody>
                </AccordionDetails>
            </StyledAccordion>
        </Section>
    );
};

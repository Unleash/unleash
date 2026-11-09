import { type ReactNode, useId } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    accordionSummaryClasses,
    Divider,
    MenuItem,
    Select,
    styled,
    TextField,
} from '@mui/material';
import ChevronRight from '@mui/icons-material/ChevronRight';
import type { StrategyFormParameters } from 'interfaces/strategy';
import type { IFormErrors } from 'hooks/useFormErrors';
import { useStickinessOptions } from 'hooks/useStickinessOptions';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import {
    FLEXIBLE_STRATEGY_GROUP_ID,
    FLEXIBLE_STRATEGY_STICKINESS_ID,
    SELECT_ITEM_ID,
} from 'utils/testIds';
import {
    parseParameterNumber,
    parseParameterString,
} from 'utils/parseParameter';
import { RolloutSlider } from 'component/feature/StrategyTypes/RolloutSlider/RolloutSlider';

const SliderArea = styled('div')(({ theme }) => ({
    padding: theme.spacing(4, 3, 3),
}));

const AdvancedSettingsAccordion = styled(Accordion)({
    containerType: 'inline-size',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    '::before': { display: 'none' },
    '&:first-of-type, &:last-of-type': {
        borderRadius: 0,
    },
});

const advancedSettingsSummarySlotProps = {
    root: {
        sx: {
            flexDirection: 'row-reverse',
            gap: 1.5,
            paddingInline: 3,
            minHeight: 0,
            color: 'text.secondary',
            fontSize: 'body1.fontSize',
        },
    },
    expandIconWrapper: {
        sx: {
            color: 'text.secondary',
            [`&.${accordionSummaryClasses.expanded}`]: {
                transform: 'rotate(90deg)',
            },
        },
    },
};

const Settings = styled(AccordionDetails)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `1fr ${theme.spacing(30)}`,
    columnGap: theme.spacing(4),
    rowGap: theme.spacing(3),
    alignItems: 'start',
    padding: theme.spacing(1, 3, 3),
    '@container (max-width: 600px)': {
        gridTemplateColumns: '1fr',
    },
}));

const SettingLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
}));

const SettingDescription = styled('p')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const OptionDescription = styled('p')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    whiteSpace: 'normal',
}));

const defaultGroupIdTooltip =
    'The group ID is part of the hash, so strategies sharing it expose the same users.';

type FlexibleStrategyProps = {
    parameters: StrategyFormParameters;
    updateParameter: (field: string, value: string) => void;
    errors?: IFormErrors;
    groupIdTooltip?: ReactNode;
};

export const FlexibleStrategy = ({
    parameters,
    updateParameter,
    errors,
    groupIdTooltip,
}: FlexibleStrategyProps) => {
    const rollout =
        parameters.rollout !== undefined
            ? parseParameterNumber(parameters.rollout)
            : 100;
    const stickiness = parseParameterString(parameters.stickiness) || 'default';
    const groupId = parseParameterString(parameters.groupId);
    const stickinessOptions = useStickinessOptions(stickiness);
    const groupIdError = errors?.getFormError('groupId');
    const stickinessLabelId = useId();
    const groupIdLabelId = useId();
    const groupIdInputId = useId();

    return (
        <>
            <SliderArea>
                <RolloutSlider
                    name='Rollout'
                    value={rollout}
                    step={5}
                    onChange={(_, value) =>
                        updateParameter('rollout', value.toString())
                    }
                />
            </SliderArea>
            <Divider />
            <AdvancedSettingsAccordion disableGutters>
                <AccordionSummary
                    expandIcon={<ChevronRight />}
                    slotProps={advancedSettingsSummarySlotProps}
                >
                    Advanced • Stickiness: {stickiness}
                </AccordionSummary>
                <Settings>
                    <div>
                        <SettingLabel>
                            <span id={stickinessLabelId}>Stickiness</span>
                        </SettingLabel>
                        <SettingDescription>
                            Which field decides who falls inside the {rollout}%.
                            The same value always gets the same answer.
                        </SettingDescription>
                    </div>
                    <Select
                        labelId={stickinessLabelId}
                        name='stickiness'
                        size='large'
                        value={stickiness}
                        MenuProps={{
                            slotProps: {
                                paper: { sx: { width: 0 } },
                            },
                        }}
                        data-testid={FLEXIBLE_STRATEGY_STICKINESS_ID}
                        onChange={(event) =>
                            updateParameter('stickiness', event.target.value)
                        }
                        renderValue={(selected) =>
                            stickinessOptions.find(
                                (option) => option.key === selected,
                            )?.label ?? selected
                        }
                    >
                        {stickinessOptions.map((option) => (
                            <MenuItem
                                key={option.key}
                                value={option.key}
                                data-testid={`${SELECT_ITEM_ID}-${option.label}`}
                            >
                                <div>
                                    {option.label}
                                    {option.description ? (
                                        <OptionDescription>
                                            {option.description}
                                        </OptionDescription>
                                    ) : null}
                                </div>
                            </MenuItem>
                        ))}
                    </Select>
                    <div>
                        <SettingLabel>
                            <label id={groupIdLabelId} htmlFor={groupIdInputId}>
                                Group ID
                            </label>
                            <HelpIcon
                                tooltip={
                                    groupIdTooltip ?? defaultGroupIdTooltip
                                }
                            />
                        </SettingLabel>
                        <SettingDescription>
                            Strategies sharing a group ID pick the same users.
                            Defaults to the flag name.
                        </SettingDescription>
                    </div>
                    <TextField
                        id={groupIdInputId}
                        size='large'
                        value={groupId}
                        onChange={(event) =>
                            updateParameter(
                                'groupId',
                                parseParameterString(event.target.value),
                            )
                        }
                        error={Boolean(groupIdError)}
                        helperText={groupIdError}
                        slotProps={{
                            htmlInput: {
                                'data-testid': FLEXIBLE_STRATEGY_GROUP_ID,
                            },
                        }}
                    />
                </Settings>
            </AdvancedSettingsAccordion>
        </>
    );
};

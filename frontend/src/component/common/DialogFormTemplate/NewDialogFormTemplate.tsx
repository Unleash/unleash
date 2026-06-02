import { type FormEventHandler, type ReactNode, useRef, useState } from 'react';
import {
    Box,
    Button,
    FormControlLabel,
    Switch,
    styled,
    useTheme,
    type Theme,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import type { IPermissionButtonProps } from 'component/common/PermissionButton/PermissionButton';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import Input from 'component/common/Input/Input';
import { NamingPatternInfo } from './NamingPatternInfo.tsx';
import type { CreateFeatureNamingPatternSchema } from 'openapi';
import { HeaderBreadcrumb } from './HeaderBreadcrumb.tsx';
import { DropdownList } from './ConfigButtons/DropdownList.tsx';
import { StyledPopover } from './ConfigButtons/shared.styles';

export type ProjectOption = { label: string; value: string };

type Props = {
    createButtonProps: IPermissionButtonProps;
    title: string;
    projects: ProjectOption[];
    project: string;
    currentProjectName?: string;
    onProjectChange: (next: string) => void;
    hideProjectSelector?: boolean;
    name: string;
    setName: (next: string) => void;
    description: string;
    setDescription: (next: string) => void;
    errors: { [key: string]: string };
    validateName?: () => void;
    namingPattern?: CreateFeatureNamingPatternSchema;
    configButtons: ReactNode;
    impressionData: boolean;
    setImpressionData: (next: boolean) => void;
    impressionDataHelp?: ReactNode;
    Limit?: ReactNode;
    handleSubmit: FormEventHandler<HTMLFormElement>;
    onClose: () => void;
    resource: string;
};

const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
}));

const Section = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
}));

// Slot-prop builder for inline inputs (no outlined border, no padding around the field).
// Uses MUI's public `slotProps` API so we avoid reaching into internal MUI classes.
// The single `fieldset` rule is unavoidable: MUI's OutlinedInput renders a fieldset
// for the notch and does not expose it as a slot.
const inlineFieldSlotProps = (htmlInputSx: Record<string, unknown>) => ({
    inputLabel: { shrink: true, sx: { display: 'none' } },
    input: { sx: { padding: 0, '& fieldset': { border: 'none' } } },
    htmlInput: { sx: { padding: 0, width: '100%', ...htmlInputSx } },
});

export const nameInputSlotProps = (theme: Theme) =>
    inlineFieldSlotProps({
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.fontWeight.bold,
        lineHeight: 1.4,
        '&::placeholder': {
            color: theme.palette.text.primary,
            opacity: 0.55,
            fontWeight: theme.fontWeight.bold,
        },
    });

export const descriptionInputSlotProps = (theme: Theme) =>
    inlineFieldSlotProps({
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.text.secondary,
        '&::placeholder': {
            color: theme.palette.text.secondary,
            opacity: 0.8,
        },
    });

const ToggleWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginLeft: theme.spacing(-1.5),
}));

export const PillButton = styled(Button)(({ theme }) => ({
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    textTransform: 'none',
    fontWeight: theme.typography.body1.fontWeight,
    borderRadius: '4px',
    padding: theme.spacing(1, 2),
    minWidth: theme.spacing(18),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    '&:hover': {
        borderColor: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
    },
}));

type DropdownOption<T> = { label: string; value: T; description?: string };

export type PillTooltip = { header: string; description: string };
type Tooltip = PillTooltip;

export const PillTrigger = ({
    label,
    onClick,
    buttonRef,
}: {
    label: string;
    onClick: () => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
}) => (
    <PillButton
        ref={buttonRef}
        variant='outlined'
        color='inherit'
        onClick={onClick}
    >
        <span>{label}</span>
        <ArrowDropDownIcon />
    </PillButton>
);

type SinglePillProps<T> = {
    label: string;
    tooltip: Tooltip;
    options: DropdownOption<T>[];
    onChange: (value: T) => void;
    searchLabel: string;
    searchPlaceholder: string;
};

export function SinglePillDropdown<T = string>({
    label,
    tooltip,
    options,
    onChange,
    searchLabel,
    searchPlaceholder,
}: SinglePillProps<T>) {
    const ref = useRef<HTMLButtonElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    return (
        <>
            <PillTrigger
                label={label}
                buttonRef={ref}
                onClick={() => setAnchorEl(ref.current)}
            />
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <DropdownList<T>
                    header={tooltip}
                    options={options}
                    onChange={(value) => {
                        onChange(value);
                        setAnchorEl(null);
                    }}
                    search={{
                        label: searchLabel,
                        placeholder: searchPlaceholder,
                    }}
                />
            </StyledPopover>
        </>
    );
}

type MultiPillProps<T> = {
    label: string;
    tooltip: Tooltip;
    options: DropdownOption<T>[];
    selectedOptions: Set<T>;
    onChange: (values: Set<T>) => void;
    searchLabel: string;
    searchPlaceholder: string;
};

export function MultiPillDropdown<T = string>({
    label,
    tooltip,
    options,
    selectedOptions,
    onChange,
    searchLabel,
    searchPlaceholder,
}: MultiPillProps<T>) {
    const ref = useRef<HTMLButtonElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const toggle = (value: T) => {
        const next = new Set(selectedOptions);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        onChange(next);
    };
    return (
        <>
            <PillTrigger
                label={label}
                buttonRef={ref}
                onClick={() => setAnchorEl(ref.current)}
            />
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <DropdownList<T>
                    header={tooltip}
                    options={options}
                    multiselect={{ selectedOptions }}
                    onChange={toggle}
                    search={{
                        label: searchLabel,
                        placeholder: searchPlaceholder,
                    }}
                />
            </StyledPopover>
        </>
    );
}

export const NewDialogFormTemplate: React.FC<Props> = ({
    createButtonProps,
    title,
    projects,
    project,
    currentProjectName,
    onProjectChange,
    hideProjectSelector,
    name,
    setName,
    description,
    setDescription,
    errors,
    validateName = () => {},
    namingPattern,
    configButtons,
    impressionData,
    setImpressionData,
    impressionDataHelp,
    Limit,
    handleSubmit,
    onClose,
    resource,
}) => {
    const theme = useTheme();

    return (
        <StyledForm onSubmit={handleSubmit}>
            <HeaderBreadcrumb
                options={hideProjectSelector ? [] : projects}
                value={project}
                valueLabel={currentProjectName}
                onChange={onProjectChange}
                title={title}
            />

            <Section sx={{ pt: 4, pb: 3, width: '100%' }}>
                <Input
                    label={`${resource} name`}
                    placeholder='Feature-flag-name'
                    aria-required
                    aria-details={
                        namingPattern?.pattern
                            ? 'naming-pattern-info'
                            : undefined
                    }
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onBlur={() => {
                        if (name) validateName();
                    }}
                    onFocus={() => {
                        delete errors.name;
                    }}
                    autoFocus
                    slotProps={nameInputSlotProps(theme)}
                    data-testid='FORM_NAME_INPUT'
                    size='medium'
                    fullWidth
                />
                {namingPattern?.pattern ? (
                    <NamingPatternInfo naming={namingPattern} />
                ) : null}
            </Section>

            <Section sx={{ pb: 4, width: '100%' }}>
                <Input
                    label='Description (optional)'
                    placeholder='Description (optional)'
                    multiline
                    maxRows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    slotProps={descriptionInputSlotProps(theme)}
                    data-testid='FORM_DESCRIPTION_INPUT'
                    size='medium'
                    fullWidth
                />
            </Section>

            <Section
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexFlow: 'row wrap',
                    pt: 2,
                    pb: 3,
                }}
            >
                {configButtons}
            </Section>

            <Section sx={{ pb: 4 }}>
                <ToggleWrapper>
                    <FormControlLabel
                        sx={{ m: 0 }}
                        control={
                            <Switch
                                checked={impressionData}
                                onChange={(e) =>
                                    setImpressionData(e.target.checked)
                                }
                            />
                        }
                        label={
                            impressionData
                                ? 'Impression data enabled'
                                : 'Impression data not enabled'
                        }
                    />
                    {impressionDataHelp ? (
                        <HelpIcon tooltip={impressionDataHelp} htmlTooltip />
                    ) : null}
                </ToggleWrapper>
            </Section>

            <Box sx={{ flex: 1 }} />

            {Limit ? <Section sx={{ pb: 2 }}>{Limit}</Section> : null}

            <Section
                sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    pt: 2,
                    pb: 3,
                }}
            >
                <Button onClick={onClose}>Cancel</Button>
                <CreateButton
                    data-testid='FORM_CREATE_BUTTON'
                    name='flag'
                    {...createButtonProps}
                />
            </Section>
        </StyledForm>
    );
};

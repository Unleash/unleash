import type { FormEventHandler, ReactNode } from 'react';
import { Box, Button, FormControlLabel, Switch, styled } from '@mui/material';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import type { IPermissionButtonProps } from 'component/common/PermissionButton/PermissionButton';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import Input from 'component/common/Input/Input';
import { NamingPatternInfo } from './NamingPatternInfo.tsx';
import type { CreateFeatureNamingPatternSchema } from 'openapi';
import { HeaderBreadcrumb } from './HeaderBreadcrumb.tsx';

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

const InlineInput = styled(Input)({
    width: '100%',
    fieldset: { border: 'none' },
    '& .MuiOutlinedInput-root': { padding: 0 },
    '& .MuiInputBase-input': { padding: 0 },
});

const NameInput = styled(InlineInput)(({ theme }) => ({
    '& .MuiInputBase-input': {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.fontWeight.bold,
        lineHeight: 1.4,
    },
    '& .MuiInputBase-input::placeholder': {
        color: theme.palette.text.primary,
        opacity: 0.55,
        fontWeight: theme.fontWeight.bold,
    },
}));

const DescriptionInput = styled(InlineInput)(({ theme }) => ({
    '& .MuiInputBase-input': {
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.text.secondary,
    },
    '& .MuiInputBase-input::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 0.8,
    },
}));

const ToggleWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginLeft: theme.spacing(-1.5),
    '& .MuiFormControlLabel-root': { margin: 0 },
}));

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
    const hiddenLabel = {
        inputLabel: { shrink: true, sx: { display: 'none' } },
    };

    return (
        <StyledForm onSubmit={handleSubmit}>
            <HeaderBreadcrumb
                options={hideProjectSelector ? [] : projects}
                value={project}
                valueLabel={currentProjectName}
                onChange={onProjectChange}
                title={title}
            />

            <Section sx={{ pt: 4, pb: 1 }}>
                <NameInput
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
                    slotProps={hiddenLabel}
                    data-testid='FORM_NAME_INPUT'
                    size='medium'
                />
                {namingPattern?.pattern ? (
                    <NamingPatternInfo naming={namingPattern} />
                ) : null}
            </Section>

            <Section sx={{ pb: 4 }}>
                <DescriptionInput
                    label='Description (optional)'
                    placeholder='Description (optional)'
                    multiline
                    maxRows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    slotProps={hiddenLabel}
                    data-testid='FORM_DESCRIPTION_INPUT'
                    size='medium'
                />
            </Section>

            <Section
                sx={{ display: 'flex', gap: 2, flexFlow: 'row wrap', pb: 3 }}
            >
                {configButtons}
            </Section>

            <Section sx={{ pb: 4 }}>
                <ToggleWrapper>
                    <FormControlLabel
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

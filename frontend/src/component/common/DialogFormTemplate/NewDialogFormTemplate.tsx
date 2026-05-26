import type { FormEventHandler, ReactNode } from 'react';
import { Button } from '@mui/material';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import type { IPermissionButtonProps } from 'component/common/PermissionButton/PermissionButton';
import { NamingPatternInfo } from './NamingPatternInfo.tsx';
import type { CreateFeatureNamingPatternSchema } from 'openapi';
import { HeaderBreadcrumb } from './HeaderBreadcrumb.tsx';
import { InlineToggleField } from './InlineToggleField.tsx';
import {
    ConfigRow,
    DescriptionInput,
    DescriptionRow,
    FormActions,
    LimitContainer,
    NameInput,
    NameRow,
    Spacer,
    StyledForm,
    ToggleRow,
} from './NewDialogFormTemplate.styles.tsx';

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
    impressionDataHelp?: string;

    Limit?: ReactNode;

    handleSubmit: FormEventHandler<HTMLFormElement>;
    onClose: () => void;
    resource: string;
};

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
    return (
        <StyledForm onSubmit={handleSubmit}>
            <HeaderBreadcrumb
                options={hideProjectSelector ? [] : projects}
                value={project}
                valueLabel={currentProjectName}
                onChange={onProjectChange}
                title={title}
            />

            <NameRow>
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
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                            sx: { display: 'none' },
                        },
                    }}
                    data-testid='FORM_NAME_INPUT'
                    size='medium'
                />
                {namingPattern?.pattern ? (
                    <NamingPatternInfo naming={namingPattern} />
                ) : null}
            </NameRow>

            <DescriptionRow>
                <DescriptionInput
                    label='Description (optional)'
                    placeholder='Description (optional)'
                    multiline
                    maxRows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                            sx: { display: 'none' },
                        },
                    }}
                    data-testid='FORM_DESCRIPTION_INPUT'
                    size='medium'
                />
            </DescriptionRow>

            <ConfigRow>{configButtons}</ConfigRow>

            <ToggleRow>
                <InlineToggleField
                    checked={impressionData}
                    onChange={setImpressionData}
                    labelOn='Impression data enabled'
                    labelOff='Impression data not enabled'
                    help={impressionDataHelp}
                />
            </ToggleRow>

            <Spacer />

            <LimitContainer>{Limit}</LimitContainer>

            <FormActions>
                <Button onClick={onClose}>Cancel</Button>
                <CreateButton
                    data-testid='FORM_CREATE_BUTTON'
                    name='flag'
                    {...createButtonProps}
                />
            </FormActions>
        </StyledForm>
    );
};

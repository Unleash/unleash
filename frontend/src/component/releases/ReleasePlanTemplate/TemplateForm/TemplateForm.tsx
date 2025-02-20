import Input from 'component/common/Input/Input';
import { styled, useTheme } from '@mui/material';
import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { TemplateFormDescription } from './TemplateFormDescription';
import { MilestoneList } from './MilestoneList/MilestoneList';

const StyledInput = styled(Input)(({ theme }) => ({
    maxWidth: theme.spacing(50),
    fieldset: { border: 'none' },
    'label::first-letter': {
        textTransform: 'uppercase',
    },
    marginBottom: theme.spacing(2),
    padding: theme.spacing(0),
}));

const StyledDescriptionInput = styled(Input)(({ theme }) => ({
    width: '100%',
    fieldset: { border: 'none' },
    'label::first-letter': {
        textTransform: 'uppercase',
    },
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2, 5, 1, 1.75),
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    paddingTop: theme.spacing(5),
}));

interface ITemplateFormProps {
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    milestones: IReleasePlanMilestonePayload[];
    setMilestones: React.Dispatch<
        React.SetStateAction<IReleasePlanMilestonePayload[]>
    >;
    errors: { [key: string]: string };
    clearErrors: () => void;
    formTitle: string;
    formatApiCode: () => string;
    handleSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
    children?: React.ReactNode;
}

export const TemplateForm: React.FC<ITemplateFormProps> = ({
    name,
    setName,
    description,
    setDescription,
    milestones,
    setMilestones,
    errors,
    clearErrors,
    formTitle,
    formatApiCode,
    handleSubmit,
    children,
}) => {
    const theme = useTheme();

    const milestoneChanged = (milestone: IReleasePlanMilestonePayload) => {
        setMilestones((prev) =>
            prev.map((mstone) =>
                mstone.id === milestone.id ? { ...milestone } : mstone,
            ),
        );
    };

    return (
        <FormTemplate
            title={formTitle}
            description={<TemplateFormDescription />}
            formatApiCode={formatApiCode}
        >
            <StyledForm onSubmit={handleSubmit}>
                <StyledInput
                    label='Template name'
                    aria-required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => {
                        delete errors.name;
                    }}
                    autoFocus
                    InputProps={{
                        style: { fontSize: theme.typography.h1.fontSize },
                    }}
                    InputLabelProps={{
                        style: { fontSize: theme.typography.h1.fontSize },
                    }}
                    size='medium'
                />
                <StyledDescriptionInput
                    label='Template description (optional)'
                    multiline
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    InputProps={{
                        style: {
                            fontSize: theme.typography.h2.fontSize,
                            padding: 0,
                        },
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: theme.typography.h2.fontSize,
                            padding: 0,
                        },
                    }}
                    size='small'
                />
                <MilestoneList
                    milestones={milestones}
                    setMilestones={setMilestones}
                    errors={errors}
                    clearErrors={clearErrors}
                    milestoneChanged={milestoneChanged}
                />

                {children}
            </StyledForm>
        </FormTemplate>
    );
};

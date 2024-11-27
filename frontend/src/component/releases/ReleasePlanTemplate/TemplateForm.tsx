import Input from 'component/common/Input/Input';
import { styled } from '@mui/material';
import { MilestoneList } from './MilestoneList';
import type {
    IReleasePlanMilestonePayload,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useState } from 'react';
import { ReleasePlanTemplateAddStrategyForm } from './ReleasePlanTemplateAddStrategyForm';
import { TemplateFormDescription } from './TemplateFormDescription';

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
    const [addStrategyOpen, setAddStrategyOpen] = useState(false);
    const [activeMilestoneId, setActiveMilestoneId] = useState<
        string | undefined
    >();
    const [strategy, setStrategy] = useState<
        Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>
    >({
        name: 'flexibleRollout',
        parameters: { rollout: '50' },
        constraints: [],
        title: '',
        id: 'temp',
    });
    const openAddStrategyForm = (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        setActiveMilestoneId(milestoneId);
        setStrategy(strategy);
        setAddStrategyOpen(true);
    };

    const addStrategy = (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        setMilestones((prev) =>
            prev.map((milestone, i) =>
                milestone.id === milestoneId
                    ? {
                          ...milestone,
                          strategies: [
                              ...(milestone.strategies || []),
                              {
                                  ...strategy,
                                  strategyName: strategy.name,
                                  sortOrder: milestone.strategies?.length || 0,
                              },
                          ],
                      }
                    : milestone,
            ),
        );
        setAddStrategyOpen(false);
        setActiveMilestoneId(undefined);
        setStrategy({
            name: 'flexibleRollout',
            parameters: { rollout: '50' },
            constraints: [],
            title: '',
            id: 'temp',
        });
    };

    return (
        <FormTemplate
            title={formTitle}
            description={<TemplateFormDescription />}
            formatApiCode={formatApiCode}
        >
            <StyledForm onSubmit={handleSubmit}>
                <StyledInputDescription>
                    What would you like to call your template?
                </StyledInputDescription>
                <StyledInput
                    label='Template name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    autoFocus
                />
                <StyledInputDescription>
                    What's the purpose of this template?
                </StyledInputDescription>
                <StyledInput
                    label='Template description (optional)'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={Boolean(errors.description)}
                    errorText={errors.description}
                    onFocus={() => clearErrors()}
                />
                <MilestoneList
                    milestones={milestones}
                    setMilestones={setMilestones}
                    openAddStrategyForm={openAddStrategyForm}
                    errors={errors}
                    clearErrors={clearErrors}
                />

                {children}

                <SidebarModal
                    label='Add strategy to template milestone'
                    onClose={() => {}}
                    open={addStrategyOpen}
                >
                    <ReleasePlanTemplateAddStrategyForm
                        milestoneId={activeMilestoneId}
                        strategy={strategy}
                        onAddStrategy={addStrategy}
                        onCancel={() => {
                            setAddStrategyOpen(false);
                        }}
                    />
                </SidebarModal>
            </StyledForm>
        </FormTemplate>
    );
};

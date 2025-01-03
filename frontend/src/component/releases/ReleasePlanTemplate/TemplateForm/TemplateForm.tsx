import Input from 'component/common/Input/Input';
import { styled } from '@mui/material';
import { MilestoneList } from './MilestoneList/MilestoneList';
import type {
    IReleasePlanMilestonePayload,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useState } from 'react';
import { ReleasePlanTemplateAddStrategyForm } from './MilestoneStrategy/ReleasePlanTemplateAddStrategyForm';
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
    const [addUpdateStrategyOpen, setAddUpdateStrategyOpen] = useState(false);
    const [activeMilestoneId, setActiveMilestoneId] = useState<
        string | undefined
    >();
    const [strategyModeEdit, setStrategyModeEdit] = useState(false);
    const [strategy, setStrategy] = useState<
        Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>
    >({
        name: 'flexibleRollout',
        parameters: { rollout: '50' },
        constraints: [],
        title: '',
        id: 'temp',
    });
    const openAddUpdateStrategyForm = (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
        editing: boolean,
    ) => {
        setStrategyModeEdit(editing);
        setActiveMilestoneId(milestoneId);
        setStrategy(strategy);
        setAddUpdateStrategyOpen(true);
    };

    const addUpdateStrategy = (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        const milestone = milestones.find((m) => m.id === milestoneId);
        const existingStrategy = milestone?.strategies?.find(
            (strat) => strat.id === strategy.id,
        );
        if (!milestone) {
            return;
        }
        if (existingStrategy) {
            milestoneStrategyChanged(milestone, strategy);
        } else {
            setMilestones((prev) =>
                prev.map((milestone, i) =>
                    milestone.id === milestoneId
                        ? {
                              ...milestone,
                              strategies: [
                                  ...(milestone.strategies || []),
                                  {
                                      ...strategy,
                                      strategyName: strategy.strategyName,
                                      sortOrder:
                                          milestone.strategies?.length || 0,
                                  },
                              ],
                          }
                        : milestone,
                ),
            );
        }
        setAddUpdateStrategyOpen(false);
        setStrategyModeEdit(false);
        setActiveMilestoneId(undefined);
        setStrategy({
            name: 'flexibleRollout',
            parameters: { rollout: '50' },
            constraints: [],
            title: '',
            id: 'temp',
        });
    };

    const milestoneChanged = (milestone: IReleasePlanMilestonePayload) => {
        setMilestones((prev) =>
            prev.map((mstone) =>
                mstone.id === milestone.id ? { ...milestone } : mstone,
            ),
        );
    };

    const milestoneStrategyChanged = (
        milestone: IReleasePlanMilestonePayload,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        const strategies = milestone.strategies || [];
        milestoneChanged({
            ...milestone,
            strategies: [
                ...strategies.map((strat) =>
                    strat.id === strategy.id ? strategy : strat,
                ),
            ],
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
                    openAddStrategyForm={openAddUpdateStrategyForm}
                    errors={errors}
                    clearErrors={clearErrors}
                    milestoneChanged={milestoneChanged}
                />

                {children}

                <SidebarModal
                    label='Add strategy to template milestone'
                    onClose={() => {
                        setAddUpdateStrategyOpen(false);
                        setStrategyModeEdit(false);
                    }}
                    open={addUpdateStrategyOpen}
                >
                    <ReleasePlanTemplateAddStrategyForm
                        milestoneId={activeMilestoneId}
                        strategy={strategy}
                        onAddUpdateStrategy={addUpdateStrategy}
                        onCancel={() => {
                            setAddUpdateStrategyOpen(false);
                            setStrategyModeEdit(false);
                        }}
                        editMode={strategyModeEdit}
                    />
                </SidebarModal>
            </StyledForm>
        </FormTemplate>
    );
};

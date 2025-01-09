import Input from 'component/common/Input/Input';
import { styled, useTheme } from '@mui/material';
import type {
    IReleasePlanMilestonePayload,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useState } from 'react';
import { TemplateFormDescription } from './TemplateFormDescription';
import { MilestoneList } from './MilestoneList/MilestoneList';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ReleasePlanTemplateAddStrategyForm } from './MilestoneStrategy/ReleasePlanTemplateAddStrategyForm';

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(40),
    fieldset: { border: 'none' },
    'label::first-letter': {
        textTransform: 'uppercase',
    },
    marginBottom: theme.spacing(3),
    padding: theme.spacing(0),
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

    const theme = useTheme();
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
                <StyledInput
                    label={`Template name`}
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
                <StyledInput
                    label='Template description (optional)'
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
                    size='medium'
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

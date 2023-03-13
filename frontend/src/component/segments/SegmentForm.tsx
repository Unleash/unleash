import { IConstraint } from 'interfaces/strategy';
import { SegmentFormStepOne } from './SegmentFormStepOne';
import { SegmentFormStepTwo } from './SegmentFormStepTwo';
import React, { useState } from 'react';
import { SegmentFormStepList } from 'component/segments/SegmentFormStepList';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';

export type SegmentFormStep = 1 | 2;
export type SegmentFormMode = 'create' | 'edit';

interface ISegmentProps {
    name: string;
    description: string;
    project?: string;
    constraints: IConstraint[];
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setProject: React.Dispatch<React.SetStateAction<string | undefined>>;
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
    mode: SegmentFormMode;
}

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

export const SegmentForm: React.FC<ISegmentProps> = ({
    children,
    name,
    description,
    project,
    constraints,
    setName,
    setDescription,
    setProject,
    setConstraints,
    handleSubmit,
    errors,
    clearErrors,
    mode,
}) => {
    const totalSteps = 2;
    const [currentStep, setCurrentStep] = useState<SegmentFormStep>(1);

    return (
        <>
            <SegmentFormStepList total={totalSteps} current={currentStep} />
            <StyledForm onSubmit={handleSubmit}>
                <ConditionallyRender
                    condition={currentStep === 1}
                    show={
                        <SegmentFormStepOne
                            name={name}
                            description={description}
                            project={project}
                            setName={setName}
                            setDescription={setDescription}
                            setProject={setProject}
                            errors={errors}
                            clearErrors={clearErrors}
                            setCurrentStep={setCurrentStep}
                        />
                    }
                />
                <ConditionallyRender
                    condition={currentStep === 2}
                    show={
                        <SegmentFormStepTwo
                            constraints={constraints}
                            setConstraints={setConstraints}
                            setCurrentStep={setCurrentStep}
                            mode={mode}
                        >
                            {children}
                        </SegmentFormStepTwo>
                    }
                />
            </StyledForm>
        </>
    );
};

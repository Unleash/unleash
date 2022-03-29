import { IConstraint } from 'interfaces/strategy';
import { useStyles } from './SegmentForm.styles';
import { SegmentFormStepOne } from '../SegmentFormStepOne/SegmentFormStepOne';
import { SegmentFormStepTwo } from '../SegmentFormStepTwo/SegmentFormStepTwo';
import React, { useState } from 'react';
import { SegmentFormStepList } from 'component/segments/SegmentFormStepList/SegmentFormStepList';
import ConditionallyRender from 'component/common/ConditionallyRender';

export type SegmentFormStep = 1 | 2;
interface ISegmentProps {
    name: string;
    description: string;
    constraints: IConstraint[];
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
}

export const SegmentForm: React.FC<ISegmentProps> = ({
    children,
    name,
    description,
    constraints,
    setName,
    setDescription,
    setConstraints,
    handleSubmit,
    errors,
    clearErrors,
}) => {
    const styles = useStyles();
    const totalSteps = 2;
    const [currentStep, setCurrentStep] = useState<SegmentFormStep>(1);

    return (
        <>
            <SegmentFormStepList total={totalSteps} current={currentStep} />
            <form onSubmit={handleSubmit} className={styles.form}>
                <ConditionallyRender
                    condition={currentStep === 1}
                    show={
                        <SegmentFormStepOne
                            name={name}
                            description={description}
                            setName={setName}
                            setDescription={setDescription}
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
                        >
                            {children}
                        </SegmentFormStepTwo>
                    }
                />
            </form>
        </>
    );
};

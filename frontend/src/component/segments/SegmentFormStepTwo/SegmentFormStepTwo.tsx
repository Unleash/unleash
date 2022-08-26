import React, { useRef, useState, useContext } from 'react';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { CreateUnleashContext } from 'component/context/CreateUnleashContext/CreateUnleashContext';
import {
    CREATE_CONTEXT_FIELD,
    CREATE_SEGMENT,
    UPDATE_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { IConstraint } from 'interfaces/strategy';
import { useNavigate } from 'react-router-dom';
import { useStyles } from 'component/segments/SegmentFormStepTwo/SegmentFormStepTwo.styles';
import {
    ConstraintAccordionList,
    IConstraintAccordionListRef,
} from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { SegmentFormStep, SegmentFormMode } from '../SegmentForm/SegmentForm';
import {
    AutocompleteBox,
    IAutocompleteBoxOption,
} from 'component/common/AutocompleteBox/AutocompleteBox';
import {
    SegmentDocsValuesWarning,
    SegmentDocsValuesError,
} from 'component/segments/SegmentDocs/SegmentDocs';
import { useSegmentValuesCount } from 'component/segments/hooks/useSegmentValuesCount';
import AccessContext from 'contexts/AccessContext';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';

interface ISegmentFormPartTwoProps {
    constraints: IConstraint[];
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    setCurrentStep: React.Dispatch<React.SetStateAction<SegmentFormStep>>;
    mode: SegmentFormMode;
}

export const SegmentFormStepTwo: React.FC<ISegmentFormPartTwoProps> = ({
    children,
    constraints,
    setConstraints,
    setCurrentStep,
    mode,
}) => {
    const constraintsAccordionListRef = useRef<IConstraintAccordionListRef>();
    const navigate = useNavigate();
    const { hasAccess } = useContext(AccessContext);
    const { classes: styles } = useStyles();
    const { context = [] } = useUnleashContext();
    const [open, setOpen] = useState(false);
    const segmentValuesCount = useSegmentValuesCount(constraints);
    const modePermission = mode === 'create' ? CREATE_SEGMENT : UPDATE_SEGMENT;
    const { segmentValuesLimit } = useSegmentLimits();

    const overSegmentValuesLimit: boolean = Boolean(
        segmentValuesLimit && segmentValuesCount > segmentValuesLimit
    );

    const autocompleteOptions = context.map(c => ({
        value: c.name,
        label: c.name,
    }));

    const onChange = ([option]: IAutocompleteBoxOption[]) => {
        constraintsAccordionListRef.current?.addConstraint?.(option.value);
    };

    return (
        <>
            <div className={styles.form}>
                <div className={styles.warning}>
                    <SegmentDocsValuesWarning />
                </div>
                <div>
                    <p className={styles.inputDescription}>
                        Select the context fields you want to include in the
                        segment.
                    </p>
                    <p className={styles.inputDescription}>
                        Use a predefined context field:
                    </p>
                    <AutocompleteBox
                        label="Select a context"
                        options={autocompleteOptions}
                        onChange={onChange}
                    />
                </div>
                <div className={styles.addContextContainer}>
                    <p className={styles.inputDescription}>
                        ...or add a new context field:
                    </p>
                    <SidebarModal
                        label="Create new context"
                        onClose={() => setOpen(false)}
                        open={open}
                    >
                        <CreateUnleashContext
                            onSubmit={() => setOpen(false)}
                            onCancel={() => setOpen(false)}
                            modal
                        />
                    </SidebarModal>
                    <PermissionButton
                        permission={CREATE_CONTEXT_FIELD}
                        variant="outlined"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => setOpen(true)}
                    >
                        Add context field
                    </PermissionButton>
                    {overSegmentValuesLimit && (
                        <div className={styles.error}>
                            <SegmentDocsValuesError
                                values={segmentValuesCount}
                            />
                        </div>
                    )}
                </div>
                <ConditionallyRender
                    condition={constraints.length === 0}
                    show={
                        <div className={styles.noConstraintText}>
                            <p className={styles.subtitle}>
                                Start adding context fields by selecting an
                                option from above, or you can create a new
                                context field and use it right away
                            </p>
                        </div>
                    }
                />
                <div className={styles.constraintContainer}>
                    <ConstraintAccordionList
                        ref={constraintsAccordionListRef}
                        constraints={constraints}
                        setConstraints={
                            hasAccess(modePermission)
                                ? setConstraints
                                : undefined
                        }
                    />
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <Button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={styles.backButton}
                >
                    Back
                </Button>
                {children}
                <Button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                        navigate('/segments');
                    }}
                >
                    Cancel
                </Button>
            </div>
        </>
    );
};

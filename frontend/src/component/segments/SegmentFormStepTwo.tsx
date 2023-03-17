import React, { useRef, useState, useContext } from 'react';
import { Button, styled } from '@mui/material';
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
import {
    ConstraintAccordionList,
    IConstraintAccordionListRef,
} from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { SegmentFormStep, SegmentFormMode } from './SegmentForm';
import {
    AutocompleteBox,
    IAutocompleteBoxOption,
} from 'component/common/AutocompleteBox/AutocompleteBox';
import {
    SegmentDocsValuesInfo,
    SegmentDocsValuesError,
} from 'component/segments/SegmentDocs';
import { useSegmentValuesCount } from 'component/segments/hooks/useSegmentValuesCount';
import AccessContext from 'contexts/AccessContext';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';
import { GO_BACK } from 'constants/navigate';

interface ISegmentFormPartTwoProps {
    constraints: IConstraint[];
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    setCurrentStep: React.Dispatch<React.SetStateAction<SegmentFormStep>>;
    mode: SegmentFormMode;
}

const StyledForm = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInfo = styled('div')(({ theme }) => ({
    marginBottom: '1.5rem',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: '1rem',
}));

const StyledAddContextContainer = styled('div')(({ theme }) => ({
    marginTop: '1rem',
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: '2rem',
}));

const StyledError = styled('div')(({ theme }) => ({
    marginTop: '1.5rem',
}));

const StyledNoConstraintText = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: theme.spacing(12),
}));

const StyledSubtitle = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    color: theme.palette.text.disabled,
    maxWidth: 515,
    marginBottom: theme.spacing(2.5),
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    textAlign: 'center',
}));

const StyledConstraintContainer = styled('div')(({ theme }) => ({
    marginBlock: theme.spacing(4),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(2),
}));

const StyledBackButton = styled(Button)(({ theme }) => ({
    marginRight: 'auto',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

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
            <StyledForm>
                <StyledInfo>
                    <SegmentDocsValuesInfo />
                </StyledInfo>
                <div>
                    <StyledInputDescription>
                        Select the context fields you want to include in the
                        segment.
                    </StyledInputDescription>
                    <StyledInputDescription>
                        Use a predefined context field:
                    </StyledInputDescription>
                    <AutocompleteBox
                        label="Select a context"
                        options={autocompleteOptions}
                        onChange={onChange}
                    />
                </div>
                <StyledAddContextContainer>
                    <StyledInputDescription>
                        ...or add a new context field:
                    </StyledInputDescription>
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
                        <StyledError>
                            <SegmentDocsValuesError
                                values={segmentValuesCount}
                            />
                        </StyledError>
                    )}
                </StyledAddContextContainer>
                <ConditionallyRender
                    condition={constraints.length === 0}
                    show={
                        <StyledNoConstraintText>
                            <StyledSubtitle>
                                Start adding context fields by selecting an
                                option from above, or you can create a new
                                context field and use it right away
                            </StyledSubtitle>
                        </StyledNoConstraintText>
                    }
                />
                <StyledConstraintContainer>
                    <ConstraintAccordionList
                        ref={constraintsAccordionListRef}
                        constraints={constraints}
                        setConstraints={
                            hasAccess(modePermission)
                                ? setConstraints
                                : undefined
                        }
                    />
                </StyledConstraintContainer>
            </StyledForm>
            <StyledButtonContainer>
                <StyledBackButton
                    type="button"
                    onClick={() => setCurrentStep(1)}
                >
                    Back
                </StyledBackButton>
                {children}
                <StyledCancelButton
                    type="button"
                    onClick={() => {
                        navigate(GO_BACK);
                    }}
                >
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </>
    );
};

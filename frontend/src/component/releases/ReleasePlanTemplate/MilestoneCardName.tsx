import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import Edit from '@mui/icons-material/Edit';
import { styled } from '@mui/material';
import { useState } from 'react';
import Input from 'component/common/Input/Input';

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
}));

const StyledMilestoneCardTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.bodySize,
}));

const StyledEditIcon = styled(Edit, {
    shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError: boolean }>(({ theme, hasError = false }) => ({
    cursor: 'pointer',
    marginTop: theme.spacing(-0.25),
    marginLeft: theme.spacing(0.5),
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    color: hasError ? theme.palette.error.main : theme.palette.text.secondary,
}));

interface IMilestoneCardNameProps {
    milestone: IReleasePlanMilestonePayload;
    errors: { [key: string]: string };
    clearErrors: () => void;
    milestoneNameChanged: (name: string) => void;
}

export const MilestoneCardName = ({
    milestone,
    errors,
    clearErrors,
    milestoneNameChanged,
}: IMilestoneCardNameProps) => {
    const [editMode, setEditMode] = useState(false);
    return (
        <>
            {editMode && (
                <StyledInput
                    label=''
                    value={milestone.name}
                    onChange={(e) => milestoneNameChanged(e.target.value)}
                    error={Boolean(errors?.[`${milestone.id}_name`])}
                    errorText={errors?.[`${milestone.id}_name`]}
                    onFocus={() => clearErrors()}
                    onBlur={() => setEditMode(false)}
                    autoFocus
                    onKeyDownCapture={(e) => {
                        if (e.code === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditMode(false);
                        }
                    }}
                />
            )}
            {!editMode && (
                <>
                    <StyledMilestoneCardTitle
                        onClick={(ev) => {
                            setEditMode(true);
                            ev.preventDefault();
                            ev.stopPropagation();
                        }}
                    >
                        {milestone.name}
                    </StyledMilestoneCardTitle>
                    <StyledEditIcon
                        hasError={Boolean(errors?.[`${milestone.id}_name`])}
                        onClick={(ev) => {
                            setEditMode(true);
                            ev.preventDefault();
                            ev.stopPropagation();
                        }}
                    />
                </>
            )}
        </>
    );
};

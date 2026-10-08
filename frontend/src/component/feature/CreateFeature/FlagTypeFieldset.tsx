import { useId, useRef, useState } from 'react';
import { Button, styled } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import type { CreateFeatureSchemaType } from 'openapi';
import { DropdownList } from 'component/common/DialogFormTemplate/ConfigButtons/DropdownList.tsx';
import { StyledPopover } from 'component/common/DialogFormTemplate/ConfigButtons/shared.styles.tsx';
import { flagTypeGroups, groupOfType } from './flagTypes.ts';
import {
    ChoiceChip,
    ChoiceGroup,
    FieldGroup,
    Legend,
} from './CreateFeatureForm.styles.ts';

const UsedForRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    color: theme.palette.text.secondary,
}));

const UsedForButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.body1.fontSize,
    padding: theme.spacing(0.5, 1),
    minWidth: 0,
    '& .MuiButton-endIcon': {
        color: theme.palette.text.secondary,
    },
}));

type FlagTypeFieldsetProps = {
    type: CreateFeatureSchemaType;
    onChange: (type: CreateFeatureSchemaType) => void;
};

export const FlagTypeFieldset = ({ type, onChange }: FlagTypeFieldsetProps) => {
    const { featureTypes } = useFeatureTypes();
    const legendId = useId();

    const selectedGroup = groupOfType(type);
    const standardTypeOptions = featureTypes
        .filter((featureType) => groupOfType(featureType.id) === 'standard')
        .map((featureType) => ({
            label: featureType.name,
            value: featureType.id,
            description: featureType.description,
        }));
    const selectedTypeName = featureTypes.find(
        (featureType) => featureType.id === type,
    )?.name;

    const selectGroup = (group: string | null) => {
        const groupType = flagTypeGroups.find(
            (flagTypeGroup) => flagTypeGroup.group === group,
        )?.type;
        if (groupType) {
            onChange(groupType);
        }
    };

    const usedForButtonRef = useRef<HTMLButtonElement>(null);
    const [usedForAnchor, setUsedForAnchor] =
        useState<HTMLButtonElement | null>(null);

    return (
        <FieldGroup component='fieldset'>
            <Legend component='legend' id={legendId}>
                Flag type
            </Legend>
            <ChoiceGroup
                exclusive
                value={selectedGroup}
                onChange={(_, group) => selectGroup(group)}
                aria-labelledby={legendId}
            >
                {flagTypeGroups.map(({ group, label, icon: Icon }) => (
                    <ChoiceChip key={group} value={group}>
                        <Icon />
                        {label}
                    </ChoiceChip>
                ))}
            </ChoiceGroup>
            {selectedGroup === 'standard' ? (
                <UsedForRow>
                    <span>Used for</span>
                    <UsedForButton
                        ref={usedForButtonRef}
                        endIcon={<KeyboardArrowDownIcon />}
                        onClick={() =>
                            setUsedForAnchor(usedForButtonRef.current)
                        }
                    >
                        {selectedTypeName ?? 'Select'}
                    </UsedForButton>
                    <StyledPopover
                        open={Boolean(usedForAnchor)}
                        anchorEl={usedForAnchor}
                        onClose={() => setUsedForAnchor(null)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <DropdownList<string>
                            header={{ header: 'Used for' }}
                            options={standardTypeOptions}
                            selectedValue={type}
                            hideSearch
                            onChange={(value) => {
                                onChange(value as CreateFeatureSchemaType);
                                setUsedForAnchor(null);
                            }}
                            search={{
                                label: 'Filter flag types',
                                placeholder: 'Select flag type',
                            }}
                        />
                    </StyledPopover>
                </UsedForRow>
            ) : null}
        </FieldGroup>
    );
};

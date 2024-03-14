import { Autocomplete, TextField, styled } from '@mui/material';
import { ActionDefinitions } from './useActionDefinitions';

const StyledActionOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:last-of-type': {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.text.secondary,
    },
}));

interface IProjectActionsActionSelectProps {
    value: string;
    onChange: (value: string) => void;
    actionDefinitions: ActionDefinitions;
}

export const ProjectActionsActionSelect = ({
    value,
    onChange,
    actionDefinitions,
}: IProjectActionsActionSelectProps) => {
    const renderActionOption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: { label: string; description?: string },
    ) => (
        <li {...props}>
            <StyledActionOption>
                <span>{option.label}</span>
                <span>{option.description}</span>
            </StyledActionOption>
        </li>
    );

    const actionOptions = [...actionDefinitions].map(
        ([key, actionDefinition]) => ({
            key,
            ...actionDefinition,
        }),
    );

    return (
        <Autocomplete
            options={actionOptions}
            autoHighlight
            autoSelect
            value={actionOptions.find(({ key }) => key === value)}
            onChange={(_, value) => onChange(value ? value.key : '')}
            renderOption={renderActionOption}
            getOptionLabel={({ label }) => label}
            renderInput={(params) => (
                <TextField {...params} size='small' label='Action' />
            )}
        />
    );
};

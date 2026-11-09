import {
    Button,
    IconButton,
    InputAdornment,
    styled,
    TextField,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Close from '@mui/icons-material/Close';
import { FormGroup } from 'component/common/FormGroup/FormGroup';

const StyledOptionList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    margin: 0,
    padding: 0,
    listStyle: 'none',
}));

interface ChoiceOptionsProps {
    options: string[];
    errors?: (string | undefined)[];
    onChange: (options: string[]) => void;
}

export const ChoiceOptions = ({
    options,
    errors = [],
    onChange,
}: ChoiceOptionsProps) => (
    <FormGroup variant='nested' title='Options'>
        <StyledOptionList>
            {options.map((option, index) => {
                const label = `Option ${index + 1}`;
                return (
                    // Options are plain strings that can be empty or repeated
                    // while typed, so they have nothing stable to key by.
                    <li key={index}>
                        <TextField
                            value={option}
                            onChange={(event) =>
                                onChange(
                                    options.with(index, event.target.value),
                                )
                            }
                            size='small'
                            fullWidth
                            error={Boolean(errors[index])}
                            helperText={errors[index]}
                            slotProps={{
                                htmlInput: { 'aria-label': label },
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <CheckBoxOutlineBlank
                                                fontSize='small'
                                                color='disabled'
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                aria-label={`Remove ${label.toLowerCase()}`}
                                                onClick={() =>
                                                    onChange(
                                                        options.toSpliced(
                                                            index,
                                                            1,
                                                        ),
                                                    )
                                                }
                                                disabled={options.length === 1}
                                                edge='end'
                                                size='small'
                                            >
                                                <Close fontSize='small' />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </li>
                );
            })}
        </StyledOptionList>
        <Button
            size='small'
            startIcon={<Add />}
            onClick={() => onChange([...options, ''])}
        >
            Add option
        </Button>
    </FormGroup>
);

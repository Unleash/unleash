import {
    Checkbox,
    Divider,
    FormControlLabel,
    IconButton,
    styled,
    Tooltip,
    Link,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import { FormField } from 'component/common/FormField/FormField';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type React from 'react';
import type { IStrategyParameter } from 'interfaces/strategy';

const paramTypesOptions = [
    {
        key: 'string',
        label: 'string',
    },
    {
        key: 'percentage',
        label: 'percentage',
    },
    {
        key: 'list',
        label: 'list',
    },
    {
        key: 'number',
        label: 'number',
    },
    {
        key: 'boolean',
        label: 'boolean',
    },
];

interface IStrategyParameterProps {
    set: React.Dispatch<React.SetStateAction<object>>;
    input: IStrategyParameter;
    index: number;
    params: IStrategyParameter[];
    setParams: React.Dispatch<React.SetStateAction<IStrategyParameter[]>>;
    errors: { [key: string]: string };
}

const StyledParamsContainer = styled('div')(({ theme }) => ({
    maxWidth: '400px',
    margin: theme.spacing(2, 0),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    borderStyle: 'dashed',
    margin: theme.spacing(2, 0, 3, 0),
    borderColor: theme.palette.neutral.border,
}));

const StyledParagraph = styled('p')(({ theme }) => ({
    minWidth: '365px',
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledNameRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    // Let the input wrapper (first child) grow to fill the row; the delete
    // button keeps its size.
    '& > :first-child': {
        flex: 1,
    },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    marginTop: theme.spacing(-1),
}));

export const StrategyParameter = ({
    set,
    input,
    index,
    params,
    setParams,
    errors,
}: IStrategyParameterProps) => {
    const onTypeChange = (type: string) => {
        set({ type });
    };

    return (
        <StyledParamsContainer>
            <StyledDivider />
            <ConditionallyRender
                condition={index === 0}
                show={
                    <StyledParagraph>
                        Parameters let you provide arguments to your strategy
                        that it can access for evaluation. Read more in the{' '}
                        <Link
                            href='https://docs.getunleash.io/concepts/activation-strategies#parameters'
                            target='_blank'
                            rel='noreferrer'
                        >
                            parameter types documentation
                        </Link>
                        .
                    </StyledParagraph>
                }
            />
            <FormField label={`Parameter name ${index + 1}`}>
                <StyledNameRow>
                    <Input
                        fullWidth
                        autoFocus
                        label=''
                        onChange={(e) => set({ name: e.target.value })}
                        value={input.name}
                        error={Boolean(errors?.[`paramName${index}`])}
                        errorText={errors?.[`paramName${index}`]}
                    />
                    <Tooltip title='Remove parameter' arrow>
                        <IconButton
                            onClick={() => {
                                setParams(
                                    params.filter((_e, i) => i !== index),
                                );
                            }}
                            size='large'
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </StyledNameRow>
            </FormField>
            <FormField label='Type'>
                <GeneralSelect
                    fullWidth
                    label=''
                    name='type'
                    options={paramTypesOptions}
                    value={input.type}
                    onChange={onTypeChange}
                />
            </FormField>
            <FormField label={`Parameter name ${index + 1} description`}>
                <Input
                    fullWidth
                    rows={2}
                    multiline
                    label=''
                    onChange={({ target }) =>
                        set({ description: target.value })
                    }
                    value={input.description}
                />
            </FormField>
            <StyledFormControlLabel
                control={
                    <Checkbox
                        checked={Boolean(input.required)}
                        onChange={() => set({ required: !input.required })}
                    />
                }
                label='Required'
            />
        </StyledParamsContainer>
    );
};

import {
    Checkbox,
    Divider,
    FormControlLabel,
    IconButton,
    styled,
    Tooltip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import React from 'react';
import { IStrategyParameter } from 'interfaces/strategy';

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
    margin: '1rem 0',
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    borderStyle: 'dashed',
    margin: '1rem 0 1.5rem 0',
    borderColor: theme.palette.grey[500],
}));

const StyledParagraph = styled('p')(({ theme }) => ({
    minWidth: '365px',
    width: '100%',
    marginBottom: '1rem',
}));

const StyledNameContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
}));

const StyledNameInput = styled(Input)(({ theme }) => ({
    minWidth: '365px',
    width: '100%',
}));

const StyledGeneralSelect = styled(GeneralSelect)(({ theme }) => ({
    minWidth: '365px',
    width: '100%',
    marginBottom: '1rem',
}));

const StyledDescriptionInput = styled(Input)(({ theme }) => ({
    minWidth: '365px',
    marginBottom: '1rem',
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    marginTop: '-0.5rem',
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
                        <a
                            href="https://docs.getunleash.io/reference/custom-activation-strategies#parameter-types"
                            target="_blank"
                            rel="noreferrer"
                        >
                            parameter types documentation
                        </a>
                        .
                    </StyledParagraph>
                }
            />
            <StyledNameContainer>
                <StyledNameInput
                    autoFocus
                    label={`Parameter name ${index + 1}*`}
                    onChange={e => set({ name: e.target.value })}
                    value={input.name}
                    error={Boolean(errors?.[`paramName${index}`])}
                    errorText={errors?.[`paramName${index}`]}
                />
                <Tooltip title="Remove parameter" arrow>
                    <IconButton
                        onClick={() => {
                            setParams(params.filter((e, i) => i !== index));
                        }}
                        size="large"
                    >
                        <Delete />
                    </IconButton>
                </Tooltip>
            </StyledNameContainer>
            <StyledGeneralSelect
                label="Type*"
                name="type"
                options={paramTypesOptions}
                value={input.type}
                onChange={onTypeChange}
                id={`prop-type-${index}-select`}
            />
            <StyledDescriptionInput
                rows={2}
                multiline
                label={`Parameter name ${index + 1} description`}
                onChange={({ target }) => set({ description: target.value })}
                value={input.description}
            />
            <StyledFormControlLabel
                control={
                    <Checkbox
                        checked={Boolean(input.required)}
                        onChange={() => set({ required: !input.required })}
                    />
                }
                label="Required"
            />
        </StyledParamsContainer>
    );
};

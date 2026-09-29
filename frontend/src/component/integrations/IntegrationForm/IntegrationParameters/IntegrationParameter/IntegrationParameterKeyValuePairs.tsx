import { Button, type ButtonProps } from '@mui/material';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import { useId } from 'react';
import { styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { MarkdownHelpText } from '../../IntegrationForm.styles';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import Add from '@mui/icons-material/Add';
import {
    getKvpsForParam,
    validateKeys,
    type KeyError,
    type KeyValuePair,
} from './KvpParameterUtils';
import { FormGroup } from 'component/common/FormGroup/FormGroup';

export interface IIntegrationParameterKeyValuePairsProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterKvps: (param: string) => (kvps: KeyValuePair[]) => void;
    config: AddonSchema;
}

const KvpList = styled('ul')(({ theme }) => ({
    '&:empty': { display: 'none' },
    padding: '0',
    listStyle: 'none',
    'li + li': { marginTop: theme.spacing(2) },
}));

const HeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.caption.fontSize,
}));

const Definitions = styled('div')(({ theme }) => ({
    '& > * + *': { marginTop: theme.spacing(1.5) },
}));

const ListCard = styled('li')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'inherit',
    '& > *': {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
}));

const RemoveButton = styled((props: ButtonProps) => (
    <Button startIcon={<DeleteOutlined />} size='small' {...props}>
        Remove
    </Button>
))(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const errorText = (key: string, error: KeyError): string => {
    switch (error) {
        case 'DuplicateKey':
            return `Duplicate key: ${key}`;
        case 'Empty':
            return "Key can't be empty";
        case 'WhitespaceOnly':
            return "Key can't be only whitespace";
    }
};

const KeyValuePairCard = ({
    pairKey,
    pairValue,
    keyError,
    remove,
    updateValue,
    updateKey,
}: {
    pairKey: string;
    pairValue: string;
    keyError?: KeyError;
    remove: () => void;
    updateValue: (value: string) => void;
    updateKey: (name: string) => void;
}) => {
    const headingId = useId();

    return (
        <ListCard role='group' aria-labelledby={headingId}>
            <HeaderRow>
                <span id={headingId}>{pairKey || 'New key-value pair'}</span>
                <RemoveButton onClick={remove} />
            </HeaderRow>

            <Definitions>
                <Input
                    sx={{ width: '100%' }}
                    size='large'
                    type={'text'}
                    label='Key'
                    value={pairKey}
                    error={Boolean(keyError)}
                    helperText={keyError && errorText(pairKey, keyError)}
                    onChange={(e) => updateKey(e.target.value)}
                />

                <Input
                    sx={{ width: '100%' }}
                    size='large'
                    minRows={5}
                    multiline={true}
                    type={'textarea'}
                    label='Value'
                    value={pairValue}
                    onChange={(e) => updateValue(e.target.value)}
                />
            </Definitions>
        </ListCard>
    );
};

export const IntegrationParameterKeyValuePairs = ({
    definition,
    config,
    parametersErrors,
    setParameterKvps,
}: IIntegrationParameterKeyValuePairsProps) => {
    const kvps = getKvpsForParam(config.parameters, definition.name);
    const setKvps = setParameterKvps(definition.name);
    const addKvp = () => setKvps([...kvps, ['', '']]);
    const removeKvp = (index: number) => () =>
        setKvps(kvps.toSpliced(index, 1));
    const updateValue = (index, key) => (newValue) =>
        setKvps(kvps.with(index, [key, newValue]));
    const updateKey = (index, value) => (newKey) =>
        setKvps(kvps.with(index, [newKey, value]));

    // Only show errors if the form was submitted with at least one error in
    // this parameter. It's strange, but in line-ish with the rest of the form.
    const keyErrors = parametersErrors[definition.name]
        ? validateKeys(kvps)
        : [];

    return (
        <FormGroup variant='nested' title={definition.displayName}>
            <MarkdownHelpText sx={{ mb: 0 }}>
                {definition.description}
            </MarkdownHelpText>
            <KvpList>
                {kvps.map(([key, value], index) => (
                    <KeyValuePairCard
                        key={index}
                        pairKey={key}
                        pairValue={value}
                        keyError={keyErrors[index]}
                        remove={removeKvp(index)}
                        updateValue={updateValue(index, key)}
                        updateKey={updateKey(index, value)}
                    />
                ))}
            </KvpList>
            <Button
                sx={{ display: 'flex' }} // allows margin collapsing w/siblings
                size='medium'
                startIcon={<Add />}
                onClick={addKvp}
            >
                Add key-value pair
            </Button>
        </FormGroup>
    );
};

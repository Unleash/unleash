import { Button, IconButton, styled, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { isObjectWithPropertiesSchema } from './schemaMatchers.ts';
import type { JsonSchemaProperty } from './payloadSchemaTypes.ts';
import { SchemaForm, SchemaFormField } from './SchemaForm.tsx';
import { SchemaFieldDescription } from './SchemaFieldDescription.tsx';

const StyledArrayGroup = styled('fieldset')(({ theme }) => ({
    border: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    // flex `gap` doesn't apply around a <legend>; make up for it when
    // there's no description (a <p>) directly after it to hug instead
    '& > legend + :not(p)': {
        marginTop: theme.spacing(1.5),
    },
}));

const StyledArrayFooter = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
});

const StyledArrayItem = styled('div')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledArrayItemRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
}));

const StyledArrayItemContent = styled('div')(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const RemoveButton = styled(IconButton)(({ theme }) => ({
    marginTop: theme.spacing(0.75),
}));

const defaultItemValue = (itemSchema: JsonSchemaProperty): unknown => {
    if (itemSchema.default !== undefined) return itemSchema.default;
    if (isObjectWithPropertiesSchema(itemSchema)) return {};
    return undefined;
};

interface ISchemaFormArrayItemProps {
    itemLabel: string;
    itemSchema: JsonSchemaProperty;
    itemValue: unknown;
    onChange: (value: unknown) => void;
    onRemove: () => void;
}

const SchemaFormArrayItem = ({
    itemLabel,
    itemSchema,
    itemValue,
    onChange,
    onRemove,
}: ISchemaFormArrayItemProps) => {
    const removeButton = (
        <RemoveButton
            size='small'
            aria-label={`Remove ${itemLabel}`}
            onClick={onRemove}
        >
            <DeleteOutlinedIcon fontSize='small' />
        </RemoveButton>
    );

    if (isObjectWithPropertiesSchema(itemSchema)) {
        return (
            <StyledArrayItem>
                <StyledArrayItemRow>
                    <StyledArrayItemContent>
                        <Typography
                            component='div'
                            variant='body2'
                            sx={{ fontWeight: 'bold', ...visuallyHidden }}
                        >
                            {itemLabel}
                        </Typography>
                        <SchemaForm
                            schema={itemSchema}
                            value={(itemValue as Record<string, unknown>) ?? {}}
                            onChange={onChange}
                        />
                    </StyledArrayItemContent>
                    {removeButton}
                </StyledArrayItemRow>
            </StyledArrayItem>
        );
    }

    return (
        <StyledArrayItemRow>
            <StyledArrayItemContent>
                <SchemaFormField
                    name={itemLabel}
                    schema={itemSchema}
                    value={itemValue}
                    onChange={onChange}
                    hideLabel
                />
            </StyledArrayItemContent>
            {removeButton}
        </StyledArrayItemRow>
    );
};

interface ISchemaFormArrayFieldProps {
    name: string;
    schema: JsonSchemaProperty;
    value: unknown;
    onChange: (value: unknown) => void;
}

export const SchemaFormArrayField = ({
    name,
    schema,
    value,
    onChange,
}: ISchemaFormArrayFieldProps) => {
    const label = schema.title ?? name;
    const items = Array.isArray(value) ? value : [];
    const itemSchema = schema.items as JsonSchemaProperty;

    const updateItem = (index: number) => (next: unknown) =>
        onChange(items.with(index, next));
    const removeItem = (index: number) => onChange(items.toSpliced(index, 1));
    const addItem = () => onChange([...items, defaultItemValue(itemSchema)]);
    const atMax =
        typeof schema.maxItems === 'number' && items.length >= schema.maxItems;

    return (
        <StyledArrayGroup>
            <Typography
                component='legend'
                variant='body2'
                sx={{ fontWeight: 'bold' }}
            >
                {label}
            </Typography>
            <SchemaFieldDescription description={schema.description} />
            {items.map((itemValue, index) => (
                <SchemaFormArrayItem
                    key={index}
                    itemLabel={`${label} ${index + 1}`}
                    itemSchema={itemSchema}
                    itemValue={itemValue}
                    onChange={updateItem(index)}
                    onRemove={() => removeItem(index)}
                />
            ))}
            <StyledArrayFooter>
                <Button
                    size='medium'
                    startIcon={<AddIcon />}
                    onClick={addItem}
                    disabled={atMax}
                >
                    Add item
                </Button>
                {typeof schema.maxItems === 'number' ? (
                    <Typography variant='body2' color='text.secondary'>
                        {items.length} of {schema.maxItems}
                    </Typography>
                ) : null}
            </StyledArrayFooter>
        </StyledArrayGroup>
    );
};

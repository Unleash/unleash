import { Fragment, type ReactNode, useRef, useState } from 'react';
import { Button, IconButton, styled, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Input from 'component/common/Input/Input';
import { isObjectWithPropertiesSchema } from './schemaMatchers.ts';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
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

const StyledKeyValueRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    flex: 1,
    '& > *': {
        flex: 1,
        minWidth: 0,
    },
}));

const RemoveButton = styled(IconButton)(({ theme }) => ({
    marginTop: theme.spacing(0.75),
}));

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const defaultItemValue = (itemSchema: JsonSchemaProperty): unknown => {
    if (itemSchema.default !== undefined) return itemSchema.default;
    if (isObjectWithPropertiesSchema(itemSchema)) return {};
    return undefined;
};

function useKeyedItems<Item>(
    initialItems: Item[],
    onChange: (items: (Item & { id: number })[]) => void,
) {
    const nextId = useRef(0);
    const [items, setItems] = useState<(Item & { id: number })[]>(() =>
        initialItems.map((item) => ({ ...item, id: nextId.current++ })),
    );

    const commit = (nextItems: (Item & { id: number })[]) => {
        setItems(nextItems);
        onChange(nextItems);
    };

    return {
        items,
        setItem: (index: number, next: Item) =>
            commit(
                items.map((item, i) =>
                    i === index ? { ...next, id: item.id } : item,
                ),
            ),
        removeItem: (index: number) =>
            commit(items.filter((_, i) => i !== index)),
        addItem: (item: Item) =>
            commit([...items, { ...item, id: nextId.current++ }]),
    };
}

interface ISchemaFormCollectionFieldProps<T extends { id: number }> {
    label: string;
    description?: string;
    items: T[];
    max?: number;
    addLabel: string;
    onAdd: () => void;
    onRemove: (index: number) => void;
    renderItem: (entry: T, index: number, removeButton: ReactNode) => ReactNode;
}

const SchemaFormCollectionField = <T extends { id: number }>({
    label,
    description,
    items,
    max,
    addLabel,
    onAdd,
    onRemove,
    renderItem,
}: ISchemaFormCollectionFieldProps<T>) => {
    const atMax = typeof max === 'number' && items.length >= max;

    return (
        <StyledArrayGroup>
            <Typography
                component='legend'
                variant='body2'
                sx={{ fontWeight: 'bold' }}
            >
                {label}
            </Typography>
            <SchemaFieldDescription description={description} />
            {items.map((entry, index) => (
                <Fragment key={entry.id}>
                    {renderItem(
                        entry,
                        index,
                        <RemoveButton
                            size='small'
                            aria-label={`Remove ${label} ${index + 1}`}
                            onClick={() => onRemove(index)}
                        >
                            <DeleteOutlinedIcon fontSize='small' />
                        </RemoveButton>,
                    )}
                </Fragment>
            ))}
            <StyledArrayFooter>
                <Button
                    size='medium'
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                    disabled={atMax}
                >
                    {addLabel}
                </Button>
                {typeof max === 'number' ? (
                    <Typography variant='body2' color='text.secondary'>
                        {items.length} of {max}
                    </Typography>
                ) : null}
            </StyledArrayFooter>
        </StyledArrayGroup>
    );
};

interface ISchemaFormArrayItemProps {
    itemLabel: string;
    itemSchema: JsonSchemaProperty;
    itemValue: unknown;
    onChange: (value: unknown) => void;
    removeButton: ReactNode;
}

const SchemaFormArrayItem = ({
    itemLabel,
    itemSchema,
    itemValue,
    onChange,
    removeButton,
}: ISchemaFormArrayItemProps) => {
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

interface ISchemaFormItem {
    value: unknown;
}

export const SchemaFormArrayField = ({
    name,
    schema,
    value,
    onChange,
}: ISchemaFormArrayFieldProps) => {
    const label = schema.title ?? name;
    const itemSchema = schema.items as JsonSchemaProperty;

    const {
        items,
        setItem,
        removeItem,
        addItem: appendItem,
    } = useKeyedItems<ISchemaFormItem>(
        (Array.isArray(value) ? value : []).map((itemValue) => ({
            value: itemValue,
        })),
        (items) => onChange(items.map((item) => item.value)),
    );

    const updateItem = (index: number) => (next: unknown) =>
        setItem(index, { value: next });
    const addItem = () => appendItem({ value: defaultItemValue(itemSchema) });

    return (
        <SchemaFormCollectionField
            label={label}
            description={schema.description}
            items={items}
            max={schema.maxItems}
            addLabel='Add item'
            onAdd={addItem}
            onRemove={removeItem}
            renderItem={(item, index, removeButton) => (
                <SchemaFormArrayItem
                    itemLabel={`${label} ${index + 1}`}
                    itemSchema={itemSchema}
                    itemValue={item.value}
                    onChange={updateItem(index)}
                    removeButton={removeButton}
                />
            )}
        />
    );
};

interface ISchemaFormDictionaryItemProps {
    itemKey: string;
    itemValue: unknown;
    valueSchema: JsonSchemaProperty;
    onChange: (key: string, value: unknown) => void;
    removeButton: ReactNode;
}

const SchemaFormDictionaryItem = ({
    itemKey,
    itemValue,
    valueSchema,
    onChange,
    removeButton,
}: ISchemaFormDictionaryItemProps) => {
    return (
        <StyledArrayItem>
            <StyledArrayItemRow>
                <StyledKeyValueRow>
                    <Input
                        label='Key'
                        value={itemKey}
                        onChange={(event) =>
                            onChange(event.target.value, itemValue)
                        }
                        fullWidth
                    />
                    <SchemaFormField
                        name='Value'
                        schema={valueSchema}
                        value={itemValue}
                        onChange={(next) => onChange(itemKey, next)}
                    />
                </StyledKeyValueRow>
                {removeButton}
            </StyledArrayItemRow>
        </StyledArrayItem>
    );
};

interface ISchemaFormDictionaryFieldProps {
    name: string;
    schema: JsonSchemaProperty;
    value: unknown;
    onChange: (value: unknown) => void;
}

interface ISchemaFormDictionaryItem {
    key: string;
    value: unknown;
}

export const SchemaFormDictionaryField = ({
    name,
    schema,
    value,
    onChange,
}: ISchemaFormDictionaryFieldProps) => {
    const label = schema.title ?? name;
    const valueSchema = schema.additionalProperties as JsonSchemaProperty;

    const {
        items,
        setItem,
        removeItem,
        addItem: appendItem,
    } = useKeyedItems<ISchemaFormDictionaryItem>(
        Object.entries(isPlainObject(value) ? value : {}).map(([key, val]) => ({
            key,
            value: val,
        })),
        (items) =>
            onChange(
                Object.fromEntries(items.map((item) => [item.key, item.value])),
            ),
    );

    const updateItem =
        (index: number) => (nextKey: string, nextValue: unknown) =>
            setItem(index, { key: nextKey, value: nextValue });
    const addItem = () =>
        appendItem({ key: '', value: defaultItemValue(valueSchema) });

    return (
        <SchemaFormCollectionField
            label={label}
            description={schema.description}
            items={items}
            max={schema.maxProperties}
            addLabel='Add entry'
            onAdd={addItem}
            onRemove={removeItem}
            renderItem={(item, index, removeButton) => (
                <SchemaFormDictionaryItem
                    itemKey={item.key}
                    itemValue={item.value}
                    valueSchema={valueSchema}
                    onChange={updateItem(index)}
                    removeButton={removeButton}
                />
            )}
        />
    );
};

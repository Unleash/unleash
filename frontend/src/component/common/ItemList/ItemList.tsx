import { Add } from '@mui/icons-material';
import { Button, Chip, Stack, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { useState } from 'react';

const StyledItemListAdd = styled('div')(({ theme }) => ({
    display: 'flex',
    marginBottom: theme.spacing(1),
    '& > div:first-of-type': {
        width: '100%',
        marginRight: theme.spacing(1),
        '& > div:first-of-type': {
            width: '100%',
        },
    },
}));

interface IItemListProps {
    label: string;
    value: string[];
    onChange: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ItemList = ({
    label,
    value,
    onChange,
    ...props
}: IItemListProps) => {
    const [inputValue, setInputValue] = useState('');

    const addItem = () => {
        onChange(prev => [...prev, inputValue]);
        setInputValue('');
    };

    const removeItem = (value: string) => {
        onChange(prev => prev.filter(item => item !== value));
    };

    return (
        <div {...props}>
            <StyledItemListAdd>
                <Input
                    label={label}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={e => {
                        if (e.key === 'Enter') {
                            addItem();
                        }
                    }}
                />
                <Button
                    startIcon={<Add />}
                    onClick={addItem}
                    variant="outlined"
                    color="primary"
                    disabled={!inputValue.trim() || value.includes(inputValue)}
                >
                    Add
                </Button>
            </StyledItemListAdd>
            <Stack flexDirection="row" flexWrap={'wrap'} gap={1}>
                {value?.map((item, index) => (
                    <Chip
                        key={index}
                        label={item}
                        onDelete={() => removeItem(item)}
                    />
                ))}
            </Stack>
        </div>
    );
};

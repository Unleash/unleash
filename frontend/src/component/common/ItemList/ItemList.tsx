import Add from '@mui/icons-material/Add';
import { Button, Chip, Stack, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { type ReactNode, useState } from 'react';

const StyledItemListAdd = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-end',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const StyledInputContainer = styled('div')({
    flex: 1,
});

interface IItemListProps {
    label: string;
    value: string[];
    onChange: React.Dispatch<React.SetStateAction<string[]>>;
    description?: ReactNode;
}

export const ItemList = ({
    label,
    value,
    onChange,
    description,
    ...props
}: IItemListProps) => {
    const [inputValue, setInputValue] = useState('');

    const addItem = () => {
        onChange((prev) => [...prev, inputValue]);
        setInputValue('');
    };

    const removeItem = (value: string) => {
        onChange((prev) => prev.filter((item) => item !== value));
    };

    return (
        <div {...props}>
            <StyledItemListAdd>
                <StyledInputContainer>
                    <Input
                        fullWidth
                        label={label}
                        value={inputValue}
                        description={description}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                addItem();
                            }
                        }}
                    />
                </StyledInputContainer>
                <Button
                    startIcon={<Add />}
                    onClick={addItem}
                    variant='outlined'
                    color='primary'
                    disabled={!inputValue.trim() || value.includes(inputValue)}
                >
                    Add
                </Button>
            </StyledItemListAdd>
            <Stack
                sx={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
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

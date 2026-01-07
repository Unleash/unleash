import { TextField, InputAdornment } from '@mui/material';
import Search from '@mui/icons-material/Search';
import { useId } from 'react';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';

interface IConstraintValueSearchProps {
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const ConstraintValueSearch = ({
    filter,
    setFilter,
    onKeyDown,
}: IConstraintValueSearchProps) => {
    const inputId = useId();
    return (
        <div
            style={{ display: 'flex', alignItems: 'center', minWidth: '120px' }}
        >
            <ScreenReaderOnly>
                <label htmlFor={inputId}>Search</label>
            </ScreenReaderOnly>
            <TextField
                id={inputId}
                name='search'
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder='Filter values'
                onKeyDown={onKeyDown}
                sx={{
                    width: '100%',
                }}
                variant='outlined'
                size='small'
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />
        </div>
    );
};

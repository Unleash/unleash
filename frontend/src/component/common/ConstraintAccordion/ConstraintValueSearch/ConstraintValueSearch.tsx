import { TextField, InputAdornment } from '@mui/material';
import Search from '@mui/icons-material/Search';

interface IConstraintValueSearchProps {
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
}

export const ConstraintValueSearch = ({
    filter,
    setFilter,
}: IConstraintValueSearchProps) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%' }}>
                <TextField
                    label='Search'
                    name='search'
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder='Filter values'
                    style={{
                        width: '100%',
                        margin: '1rem 0',
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
        </div>
    );
};

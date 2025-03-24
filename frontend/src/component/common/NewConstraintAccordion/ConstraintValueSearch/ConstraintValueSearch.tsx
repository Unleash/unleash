import { TextField, InputAdornment, Chip } from '@mui/material';
import Search from '@mui/icons-material/Search';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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
            <div style={{ width: '300px' }}>
                <TextField
                    label='Search'
                    name='search'
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder='Filter values'
                    sx={(theme) => ({
                        width: '100%',
                        margin: theme.spacing(1, 0, 2),
                    })}
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
            <ConditionallyRender
                condition={Boolean(filter)}
                show={
                    <Chip
                        style={{ marginLeft: '1rem' }}
                        label={`filter active: ${filter}`}
                        onDelete={() => setFilter('')}
                    />
                }
            />
        </div>
    );
};

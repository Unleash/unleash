import { TextField, InputAdornment, Chip } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import ConditionallyRender from 'component/common/ConditionallyRender';

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
                    label="Search"
                    name="search"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Filter values"
                    style={{
                        width: '100%',
                        margin: '1rem 0',
                    }}
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
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

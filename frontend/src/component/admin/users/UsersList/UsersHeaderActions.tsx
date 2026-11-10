import { Button, IconButton, Tooltip } from '@mui/material';
import Download from '@mui/icons-material/Download';
import { useNavigate } from 'react-router';
import { Search } from 'component/common/Search/Search';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useAccessOverviewApi } from 'hooks/api/actions/useAccessOverviewApi/useAccessOverviewApi';

interface IUsersHeaderActionsProps {
    searchValue: string;
    onSearch: (value: string) => void;
    isSmallScreen: boolean;
}

export const UsersHeaderActions = ({
    searchValue,
    onSearch,
    isSmallScreen,
}: IUsersHeaderActionsProps) => {
    const navigate = useNavigate();
    const { downloadCSV } = useAccessOverviewApi();

    return (
        <>
            <ConditionallyRender
                condition={!isSmallScreen}
                show={<Search initialValue={searchValue} onChange={onSearch} />}
            />
            <PageHeader.Divider />
            <Tooltip
                title='Exports user access information'
                arrow
                describeChild
            >
                <IconButton onClick={downloadCSV}>
                    <Download />
                </IconButton>
            </Tooltip>
            <Button
                variant='contained'
                color='primary'
                onClick={() => navigate('/admin/create-user')}
            >
                Add new user
            </Button>
        </>
    );
};

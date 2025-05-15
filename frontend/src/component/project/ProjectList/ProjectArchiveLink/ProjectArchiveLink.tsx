import {
    IconButton,
    Link,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Inventory2Outlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import type { FC } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const ProjectArchiveLink: FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { isOss } = useUiConfig();

    if (isOss()) return null;

    if (isSmallScreen) {
        return (
            <Tooltip arrow title='See archived projects'>
                <IconButton
                    onClick={() => navigate('/projects-archive')}
                    data-loading
                >
                    <ArchiveIcon />
                </IconButton>
            </Tooltip>
        );
    }
    return (
        <>
            <Link component={RouterLink} to='/projects-archive' data-loading>
                Archived projects
            </Link>
            <PageHeader.Divider />
        </>
    );
};

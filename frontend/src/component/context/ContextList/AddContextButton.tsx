import type { VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { CREATE_CONTEXT_FIELD } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';

type IAddContextButtonProps = {};

export const AddContextButton: VFC<IAddContextButtonProps> = () => {
    const smallScreen = useMediaQuery('(max-width:700px)');
    const navigate = useNavigate();

    return smallScreen ? (
        <PermissionIconButton
            permission={CREATE_CONTEXT_FIELD}
            onClick={() => navigate('/context/create')}
            size='large'
            tooltipProps={{ title: 'Add context type' }}
        >
            <Add />
        </PermissionIconButton>
    ) : (
        <PermissionButton
            onClick={() => navigate('/context/create')}
            permission={CREATE_CONTEXT_FIELD}
            color='primary'
            variant='contained'
        >
            New context field
        </PermissionButton>
    );
};

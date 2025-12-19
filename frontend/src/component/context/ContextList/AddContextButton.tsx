import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import type { FC } from 'react';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';
import {
    CREATE_CONTEXT_FIELD,
    UPDATE_PROJECT,
} from '@server/types/permissions.ts';

type IAddContextButtonProps = {};

export const AddContextButton: FC<IAddContextButtonProps> = () => {
    const smallScreen = useMediaQuery('(max-width:700px)');
    const navigate = useNavigate();
    const projectId = useOptionalPathParam('projectId');

    const createLocation = projectId
        ? `/projects/${projectId}/settings/context/create`
        : '/context/create';

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <PermissionIconButton
                    permission={[CREATE_CONTEXT_FIELD, UPDATE_PROJECT]}
                    projectId={projectId}
                    onClick={() => navigate(createLocation)}
                    size='large'
                    tooltipProps={{ title: 'Add context type' }}
                >
                    <Add />
                </PermissionIconButton>
            }
            elseShow={
                <PermissionButton
                    permission={[CREATE_CONTEXT_FIELD, UPDATE_PROJECT]}
                    projectId={projectId}
                    onClick={() => navigate(createLocation)}
                    color='primary'
                    variant='contained'
                >
                    New context field
                </PermissionButton>
            }
        />
    );
};

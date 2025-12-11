import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import type { FC } from 'react';
import { useDynamicContextActionParams } from './useDynamicContextActionParams.ts';

type IAddContextButtonProps = {};

export const AddContextButton: FC<IAddContextButtonProps> = () => {
    const smallScreen = useMediaQuery('(max-width:700px)');
    const navigate = useNavigate();
    const { permissions, locations } = useDynamicContextActionParams();

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <PermissionIconButton
                    permission={permissions.create}
                    onClick={() => navigate(locations.create)}
                    size='large'
                    tooltipProps={{ title: 'Add context type' }}
                >
                    <Add />
                </PermissionIconButton>
            }
            elseShow={
                <PermissionButton
                    onClick={() => navigate(locations.create)}
                    permission={permissions.create}
                    color='primary'
                    variant='contained'
                >
                    New context field
                </PermissionButton>
            }
        />
    );
};

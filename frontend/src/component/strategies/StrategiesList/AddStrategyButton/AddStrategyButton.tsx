import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { useMediaQuery } from '@mui/material';
import { CREATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ADD_NEW_STRATEGY_ID } from 'utils/testIds';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const AddStrategyButton = () => {
    const smallScreen = useMediaQuery('(max-width:700px)');
    const navigate = useNavigate();

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <PermissionIconButton
                    data-testid={ADD_NEW_STRATEGY_ID}
                    onClick={() => navigate('/strategies/create')}
                    permission={CREATE_STRATEGY}
                    size="large"
                    tooltipProps={{ title: 'New strategy type' }}
                >
                    <Add />
                </PermissionIconButton>
            }
            elseShow={
                <PermissionButton
                    onClick={() => navigate('/strategies/create')}
                    color="primary"
                    permission={CREATE_STRATEGY}
                    data-testid={ADD_NEW_STRATEGY_ID}
                >
                    New strategy type
                </PermissionButton>
            }
        />
    );
};

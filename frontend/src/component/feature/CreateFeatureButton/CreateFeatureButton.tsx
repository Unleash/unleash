import classnames from 'classnames';
import { Link, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Add } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { NAVIGATE_TO_CREATE_FEATURE } from 'utils/testIds';
import { IFeaturesFilter } from 'hooks/useFeaturesFilter';
import { useCreateFeaturePath } from 'component/feature/CreateFeatureButton/useCreateFeaturePath';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';

interface ICreateFeatureButtonProps {
    loading: boolean;
    filter: IFeaturesFilter;
}

export const CreateFeatureButton = ({
    loading,
    filter,
}: ICreateFeatureButtonProps) => {
    const smallScreen = useMediaQuery('(max-width:800px)');
    const createFeature = useCreateFeaturePath(filter);
    const navigate = useNavigate();

    if (!createFeature) {
        return null;
    }

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <PermissionIconButton
                    permission={CREATE_FEATURE}
                    projectId={createFeature.projectId}
                    component={Link}
                    to={createFeature.path}
                    size="large"
                    tooltipProps={{
                        title: 'Create feature toggle',
                    }}
                >
                    <Add />
                </PermissionIconButton>
            }
            elseShow={
                <PermissionButton
                    onClick={() => {
                        navigate(createFeature.path);
                    }}
                    permission={CREATE_FEATURE}
                    projectId={createFeature.projectId}
                    color="primary"
                    variant="contained"
                    data-testid={NAVIGATE_TO_CREATE_FEATURE}
                    className={classnames({ skeleton: loading })}
                >
                    New feature toggle
                </PermissionButton>
            }
        />
    );
};

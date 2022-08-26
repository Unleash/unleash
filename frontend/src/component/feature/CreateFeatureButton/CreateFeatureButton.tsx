import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Button, IconButton, Tooltip } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Add } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { NAVIGATE_TO_CREATE_FEATURE } from 'utils/testIds';
import { IFeaturesFilter } from 'hooks/useFeaturesFilter';
import { useCreateFeaturePath } from 'component/feature/CreateFeatureButton/useCreateFeaturePath';

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

    if (!createFeature) {
        return null;
    }

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <Tooltip title="Create feature toggle" arrow>
                    <IconButton
                        component={Link}
                        to={createFeature.path}
                        data-testid={NAVIGATE_TO_CREATE_FEATURE}
                        disabled={!createFeature.access}
                        size="large"
                    >
                        <Add />
                    </IconButton>
                </Tooltip>
            }
            elseShow={
                <Button
                    to={createFeature.path}
                    color="primary"
                    variant="contained"
                    component={Link}
                    data-testid={NAVIGATE_TO_CREATE_FEATURE}
                    disabled={!createFeature.access}
                    className={classnames({ skeleton: loading })}
                >
                    New feature toggle
                </Button>
            }
        />
    );
};

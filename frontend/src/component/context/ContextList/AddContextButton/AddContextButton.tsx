import { useContext, VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { Add } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { CREATE_CONTEXT_FIELD } from 'component/providers/AccessProvider/permissions';

interface IAddContextButtonProps {}

export const AddContextButton: VFC<IAddContextButtonProps> = () => {
    const smallScreen = useMediaQuery('(max-width:700px)');
    const { hasAccess } = useContext(AccessContext);
    const navigate = useNavigate();

    return (
        <ConditionallyRender
            condition={hasAccess(CREATE_CONTEXT_FIELD)}
            show={
                <ConditionallyRender
                    condition={smallScreen}
                    show={
                        <Tooltip title="Add context type" arrow>
                            <IconButton
                                onClick={() => navigate('/context/create')}
                                size="large"
                            >
                                <Add />
                            </IconButton>
                        </Tooltip>
                    }
                    elseShow={
                        <Button
                            onClick={() => navigate('/context/create')}
                            color="primary"
                            variant="contained"
                        >
                            New context field
                        </Button>
                    }
                />
            }
        />
    );
};

import React, { FC, useState } from 'react';
import { Box, Button, IconButton, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { IChangeRequest } from '../../changeRequest.types';
import { Edit } from '@mui/icons-material';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestApi } from '../../../../hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { formatUnknownError } from '../../../../utils/formatUnknownError';
import useToast from '../../../../hooks/useToast';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    '& > div': { width: '100%' },
    justifyContent: 'space-between',
}));

export const EnvironmentChangeRequestTitle: FC<{
    environmentChangeRequest: IChangeRequest;
}> = ({ environmentChangeRequest }) => {
    const [title, setTitle] = useState(environmentChangeRequest.title);
    const [isDisabled, setIsDisabled] = useState(true);
    const { updateTitle } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();

    const toggleEditState = () => {
        setIsDisabled(!isDisabled);
    };

    const saveTitle = async () => {
        toggleEditState();
        try {
            await updateTitle(
                environmentChangeRequest.project,
                environmentChangeRequest.id,
                title
            );
            setToastData({
                type: 'success',
                title: 'Change request title updated!',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };
    return (
        <StyledBox>
            <Input
                label="Change request title"
                id="group-name"
                value={title}
                fullWidth
                onChange={e => setTitle(e.target.value)}
                disabled={isDisabled}
            />
            <ConditionallyRender
                condition={isDisabled}
                show={
                    <IconButton onClick={toggleEditState}>
                        <Edit />
                    </IconButton>
                }
            />
            <ConditionallyRender
                condition={!isDisabled}
                show={
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={theme => ({ marginLeft: theme.spacing(4) })}
                            onClick={() => saveTitle()}
                        >
                            Save
                        </Button>
                        <Button
                            sx={theme => ({ marginLeft: theme.spacing(1) })}
                            variant="outlined"
                            onClick={toggleEditState}
                        >
                            Cancel
                        </Button>{' '}
                    </>
                }
            />
        </StyledBox>
    );
};

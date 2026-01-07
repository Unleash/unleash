import type React from 'react';
import { type FC, useState } from 'react';
import { Box, Button, IconButton, styled, Typography } from '@mui/material';
import Input from 'component/common/Input/Input';
import type { ChangeRequestType } from '../../changeRequest.types';
import Edit from '@mui/icons-material/Edit';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    '& > div': { width: '100%' },
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
}));

export const StyledHeader = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1),
    fontSize: theme.fontSizes.mainHeader,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
}));

export const ChangeRequestTitle: FC<{
    environmentChangeRequest: ChangeRequestType;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    children?: React.ReactNode;
}> = ({ environmentChangeRequest, title, setTitle, children }) => {
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
                title,
            );
            setToastData({
                type: 'success',
                text: 'Change request title updated!',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };
    return (
        <StyledBox>
            <ConditionallyRender
                condition={isDisabled}
                show={children}
                elseShow={
                    <Input
                        label='Change request title'
                        id='group-name'
                        value={title}
                        fullWidth
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isDisabled}
                    />
                }
            />
            <ConditionallyRender
                condition={isDisabled}
                show={
                    <StyledIconButton onClick={toggleEditState}>
                        <Edit />
                    </StyledIconButton>
                }
            />
            <ConditionallyRender
                condition={!isDisabled}
                show={
                    <>
                        <Button
                            variant='contained'
                            color='primary'
                            sx={(theme) => ({ marginLeft: theme.spacing(2) })}
                            onClick={() => saveTitle()}
                        >
                            Save
                        </Button>
                        <Button
                            sx={(theme) => ({ marginLeft: theme.spacing(1) })}
                            variant='outlined'
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

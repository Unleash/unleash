import { Badge, IconButton, Tooltip, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ActionsFilterState } from './useProjectActionsForm';
import { Fragment } from 'react';
import { Delete } from '@mui/icons-material';
import Input from 'component/common/Input/Input';
import {
    BoxSeparator,
    StyledInnerBoxHeader,
    StyledRow,
    StyledInnerBox,
} from './InnerContainerBox';

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    color: 'primary',
    margin: theme.spacing(1),
}));

export const ProjectActionsFilterItem = ({
    filter,
    index,
    stateChanged,
    onDelete,
}: {
    filter: ActionsFilterState;
    index: number;
    stateChanged: (updatedFilter: ActionsFilterState) => void;
    onDelete: () => void;
}) => {
    const { parameter, value } = filter;
    return (
        <Fragment>
            <ConditionallyRender
                condition={index > 0}
                show={<BoxSeparator>AND</BoxSeparator>}
            />
            <StyledInnerBox>
                <StyledRow>
                    <span>Filter {index + 1}</span>
                    <StyledInnerBoxHeader>
                        <Tooltip title='Delete filter' arrow>
                            <IconButton type='button' onClick={onDelete}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </StyledInnerBoxHeader>
                </StyledRow>
                <StyledRow>
                    <StyledInput
                        label='Parameter'
                        value={parameter}
                        onChange={(e) =>
                            stateChanged({
                                ...filter,
                                parameter: e.target.value,
                            })
                        }
                    />
                    <StyledBadge>=</StyledBadge>
                    <StyledInput
                        label='Value'
                        value={value}
                        onChange={(e) =>
                            stateChanged({
                                ...filter,
                                value: e.target.value,
                            })
                        }
                    />
                </StyledRow>
            </StyledInnerBox>
        </Fragment>
    );
};

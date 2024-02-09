import { Badge, IconButton, Tooltip, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IActionFilter } from './useProjectActionsForm';
import { Fragment } from 'react';
import { Delete } from '@mui/icons-material';
import Input from 'component/common/Input/Input';
import {
    BoxSeparator,
    InnerBoxHeader,
    Row,
    StyledInnerBox,
} from './InnerContainerBox';

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

const FilterOperation = styled(Badge)(({ theme }) => ({
    color: 'primary',
    margin: 'auto',
    marginBottom: theme.spacing(1.5),
}));

export const FilterItem = ({
    filter,
    index,
    stateChanged,
    onDelete,
}: {
    filter: IActionFilter;
    index: number;
    stateChanged: (updatedFilter: IActionFilter) => void;
    onDelete: () => void;
}) => {
    const { id, parameter, value } = filter;
    return (
        <Fragment>
            <ConditionallyRender
                condition={index > 0}
                show={<BoxSeparator>AND</BoxSeparator>}
            />
            <StyledInnerBox>
                <Row>
                    <span>Filter {index + 1}</span>
                    <InnerBoxHeader>
                        <Tooltip title='Delete filter' arrow>
                            <IconButton type='button' onClick={onDelete}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </InnerBoxHeader>
                </Row>
                <Row>
                    <StyledInput
                        label='Parameter'
                        value={parameter}
                        onChange={(e) =>
                            stateChanged({
                                id,
                                parameter: e.target.value,
                                value,
                            })
                        }
                    />
                    <FilterOperation
                        sx={{
                            margin: '0 4px',
                        }}
                    >
                        =
                    </FilterOperation>
                    <StyledInput
                        label='Value'
                        value={value}
                        onChange={(e) =>
                            stateChanged({
                                id,
                                parameter,
                                value: e.target.value,
                            })
                        }
                    />
                </Row>
            </StyledInnerBox>
        </Fragment>
    );
};

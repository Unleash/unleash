import { Badge, IconButton, Tooltip, styled } from '@mui/material';
import { ActionsFilterState } from './useProjectActionsForm';
import { Delete } from '@mui/icons-material';
import Input from 'component/common/Input/Input';
import { ProjectActionsFormItem } from './ProjectActionsFormItem';

const StyledInputContainer = styled('div')({
    flex: 1,
});

const StyledInput = styled(Input)({
    width: '100%',
});

const StyledBadge = styled(Badge)(({ theme }) => ({
    margin: theme.spacing(0, 1),
    fontSize: theme.fontSizes.mainHeader,
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

    const header = (
        <>
            <span>Filter {index + 1}</span>
            <div>
                <Tooltip title='Delete filter' arrow>
                    <IconButton onClick={onDelete}>
                        <Delete />
                    </IconButton>
                </Tooltip>
            </div>
        </>
    );

    return (
        <ProjectActionsFormItem index={index} header={header}>
            <StyledInputContainer>
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
            </StyledInputContainer>
            <StyledBadge>=</StyledBadge>
            <StyledInputContainer>
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
            </StyledInputContainer>
        </ProjectActionsFormItem>
    );
};

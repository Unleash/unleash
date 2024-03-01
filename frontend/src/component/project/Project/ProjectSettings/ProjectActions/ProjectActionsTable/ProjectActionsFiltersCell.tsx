import { styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IActionSet } from 'interfaces/action';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IProjectActionsFiltersCellProps {
    action: IActionSet;
}

export const ProjectActionsFiltersCell = ({
    action,
}: IProjectActionsFiltersCellProps) => {
    const { payload } = action.match;
    const filters = Object.entries(payload);

    if (filters.length === 0) {
        return <TextCell>0 filters</TextCell>;
    }

    return (
        <TextCell>
            <TooltipLink
                tooltip={
                    <>
                        {filters.map(
                            ([
                                parameter,
                                {
                                    inverted,
                                    operator,
                                    caseInsensitive,
                                    value,
                                    values,
                                },
                            ]) => (
                                <StyledItem key={parameter}>
                                    <strong>{parameter}</strong>{' '}
                                    {inverted ? 'NOT' : ''} {operator}{' '}
                                    {caseInsensitive
                                        ? '(case insensitive)'
                                        : ''}{' '}
                                    <strong>
                                        {values ? values.join(', ') : value}
                                    </strong>
                                </StyledItem>
                            ),
                        )}
                    </>
                }
            >
                {filters.length === 1
                    ? '1 filter'
                    : `${filters.length} filters`}
            </TooltipLink>
        </TextCell>
    );
};

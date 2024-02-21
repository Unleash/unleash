import { styled } from '@mui/material';
import {
    SidePanelListColumn,
    StyledSidePanelListColumn,
} from './SidePanelList';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.table.headerBackground,
}));

const StyledHeaderHalf = styled('div')({
    display: 'flex',
    flex: 1,
});

interface ISidePanelListHeaderProps<T> {
    columns: SidePanelListColumn<T>[];
    sidePanelHeader: string;
}

export const SidePanelListHeader = <T,>({
    columns,
    sidePanelHeader,
}: ISidePanelListHeaderProps<T>) => (
    <StyledHeader>
        <StyledHeaderHalf>
            {columns.map(({ header, maxWidth, align }) => (
                <StyledSidePanelListColumn
                    key={header}
                    maxWidth={maxWidth}
                    align={align}
                >
                    {header}
                </StyledSidePanelListColumn>
            ))}
        </StyledHeaderHalf>
        <StyledHeaderHalf>
            <StyledSidePanelListColumn>
                {sidePanelHeader}
            </StyledSidePanelListColumn>
        </StyledHeaderHalf>
    </StyledHeader>
);

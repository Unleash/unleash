import { styled } from '@mui/material';
import { StyledDropdownSearch } from 'component/common/DialogFormTemplate/ConfigButtons/shared.styles';

export const TableSearchInput = styled(StyledDropdownSearch)({
    maxWidth: '30ch',
});

export const ScrollContainer = styled('div')({
    width: '100%',
    overflow: 'auto',
});

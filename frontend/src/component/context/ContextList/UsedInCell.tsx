import type { VFC } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { Box } from '@mui/material';
import type { IUnleashContextDefinition } from 'interfaces/context';

interface IUsedInCellProps {
    original: IUnleashContextDefinition;
}

export const UsedInCell: VFC<IUsedInCellProps> = ({ original }) => {
    const projectText = original.usedInProjects === 1 ? 'project' : 'projects';
    const flagsText = original.usedInFeatures === 1 ? 'flag' : 'flags';
    return (
        <TextCell
            sx={{
                color:
                    original.usedInProjects === 0 &&
                    original.usedInFeatures === 0
                        ? theme.palette.text.disabled
                        : 'inherit',
            }}
        >
            <Box>
                {original.usedInProjects} {projectText}
            </Box>
            <Box>
                {original.usedInFeatures} feature {flagsText}
            </Box>
        </TextCell>
    );
};

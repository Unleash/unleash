import type React from 'react';
import { type PropsWithChildren, useState, type FC, useId } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Typography, Link, styled, Tabs, Tab } from '@mui/material';
import { ConflictWarning } from './Change/ConflictWarning.tsx';

type SegmentProps = {
    resourceType: 'Segment';
    segment: {
        id: number;
        name: string;
    };
};

type FlagProps = {
    resourceType: 'Feature flag';
    flag: {
        projectId: string;
        name: string;
    };
};

type Props = {
    conflict?: string;
    onNavigate?: () => void;
    children?: React.ReactNode;
    diff?: React.ReactNode;
} & (SegmentProps | FlagProps);

const HeaderGroup = styled('hgroup', {
    shouldForwardProp: (prop) => prop !== 'conflict',
})<{ conflict?: string }>(({ theme, conflict }) => ({
    display: 'flex',
    paddingTop: theme.spacing(conflict ? 0 : 2),
    paddingBottom: theme.spacing(2),
    paddingInline: theme.spacing(3),
}));

const BottomRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const TabPanel: FC<
    PropsWithChildren<{
        index: number;
        value: number;
        id: string;
        'aria-labelledby': string;
    }>
> = ({ children, index, value, id, 'aria-labelledby': ariaLabelledBy }) => {
    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={id}
            aria-labelledby={ariaLabelledBy}
        >
            {value === index ? children : null}
        </div>
    );
};

const tabA11yProps = (baseId: string) => (index: number) => ({
    id: `${baseId}-tab-${index}`,
    'aria-controls': `${baseId}-${index}`,
});

export const SwitchableChangeCard: FC<Props> = ({
    conflict,
    onNavigate,
    children,
    diff,
    resourceType,
    ...resourceProps
}) => {
    const [tabIndex, setTabIndex] = useState(0);
    const baseId = useId();
    const allyProps = tabA11yProps(baseId);

    const [url, name] =
        'segment' in resourceProps
            ? [
                  `/segments/edit/${resourceProps.segment.id}`,
                  resourceProps.segment.name,
              ]
            : [
                  `/projects/${resourceProps.flag.projectId}/features/${resourceProps.flag.name}`,
                  resourceProps.flag.name,
              ];

    return (
        <Card
            elevation={0}
            sx={(theme) => ({
                marginTop: theme.spacing(2),
                overflow: 'hidden',
            })}
        >
            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.neutral.light,
                    borderRadius: (theme) =>
                        `${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px 0 0`,
                    border: '1px solid',
                    borderColor: (theme) =>
                        conflict
                            ? theme.palette.warning.border
                            : theme.palette.divider,
                    borderBottom: 'none',
                    overflow: 'hidden',
                })}
            >
                <ConflictWarning conflict={conflict} />
                <BottomRow>
                    <HeaderGroup conflict={conflict}>
                        <Typography>{resourceType}:</Typography>
                        <Typography component='h3'>
                            <Link
                                component={RouterLink}
                                to={url}
                                color='primary'
                                underline='hover'
                                sx={{
                                    marginLeft: 1,
                                    '& :hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                                onClick={onNavigate}
                            >
                                <strong>{name}</strong>
                            </Link>
                        </Typography>
                    </HeaderGroup>
                    <Tabs
                        selectionFollowsFocus
                        aria-label='Choose view'
                        value={tabIndex}
                        onChange={(_, newValue) => setTabIndex(newValue)}
                    >
                        <Tab label='Change' {...allyProps(0)} />
                        <Tab label='Diff' {...allyProps(1)} />
                    </Tabs>
                </BottomRow>
            </Box>
            <TabPanel
                id={`${baseId}-${0}`}
                aria-labelledby={`${baseId}-tab-${0}`}
                value={tabIndex}
                index={0}
            >
                {children}
            </TabPanel>
            <TabPanel
                id={`${baseId}-${1}`}
                aria-labelledby={`${baseId}-tab-${1}`}
                value={tabIndex}
                index={1}
            >
                {diff}
            </TabPanel>
        </Card>
    );
};

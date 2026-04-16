import { Typography, styled } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from 'react-router-dom';

const SidebarSection = styled('article')(({ theme }) => ({
    '--vertical-spacing': theme.spacing(1.5),
    fontSize: theme.typography.body2.fontSize,
    '& > * + *': {
        marginTop: theme.spacing(1.5),
    },
    h4: {
        fontWeight: 'bold',
    },
}));

const Tips = styled('ul')(({ theme }) => ({
    paddingInline: theme.spacing(2.5),
    margin: 0,
}));

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBlockEnd: theme.spacing(2),
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'underline',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: 'body2.fontSize',
    width: 'fit-content',
    borderRadius: theme.shape.borderRadius,

    ':focus-visible': {
        outline: `2px solid currentColor`,
        outlineOffset: theme.spacing(0.5),
    },

    svg: {
        fontSize: '20px',
    },
}));

const SidebarLink = ({ to, children }) => {
    return (
        <StyledLink target='_blank' rel='noopener noreferrer' to={to}>
            {children} <OpenInNewIcon />
        </StyledLink>
    );
};

export const MetricDefinitionSidebar = () => {
    return (
        <>
            <SidebarSection>
                <Header>
                    <InfoOutlinedIcon />
                    <Typography variant='body2' component='h4'>
                        What are impact metrics?
                    </Typography>
                </Header>
                <Typography variant='body2'>
                    Impact metrics are numerical measurements that track the
                    impact of your feature flags. They help you understand if a
                    feature is performing as expected and can be set up to
                    trigger automated safeguards when issues arise.
                </Typography>
            </SidebarSection>

            <SidebarSection>
                <Header>
                    <LightbulbOutlinedIcon />
                    <Typography variant='body2' component='h4'>
                        Best practices
                    </Typography>
                </Header>
                <Tips>
                    <li>
                        Use descriptive, specific names that indicate what
                        you're measuring
                    </li>
                    <li>
                        Choose the metric type that matches how the value
                        changes over time
                    </li>
                    <li>
                        Track both positive indicators (success) and negative
                        indicators (errors)
                    </li>
                </Tips>
            </SidebarSection>

            <div>
                <SidebarLink to='https://docs.getunleash.io/reference/impact-metrics'>
                    View full documentation
                </SidebarLink>
            </div>
        </>
    );
};

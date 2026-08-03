import { useState, type ReactNode } from 'react';
import { Box, Typography, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import AccessContext, { type IAccessContext } from 'contexts/AccessContext';

// --- Catalog components ---------------------------------------------------
// Input
import Input from 'component/common/Input/Input';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { SelectField } from 'component/common/SelectField/SelectField';
import { AutocompleteField } from 'component/common/AutocompleteField/AutocompleteField';
import PasswordField from 'component/common/PasswordField/PasswordField';
import { Search } from 'component/common/Search/Search';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
// Display
import { Badge } from 'component/common/Badge/Badge';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Truncator } from 'component/common/Truncator/Truncator';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
// Feedback
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Banner } from 'component/banners/Banner/Banner';
import Loader from 'component/common/Loader/Loader';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
// Layout
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { FormField } from 'component/common/FormField/FormField';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';

// --- Gallery scaffolding --------------------------------------------------
const noop = () => {};

const Page = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    maxWidth: 1400,
    margin: '0 auto',
}));

const CategoryHeading = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.typography.fontWeightBold,
    marginTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: `2px solid ${theme.palette.divider}`,
}));

const Section = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightBold,
}));

const SectionMeta = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
}));

const Matrix = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
}));

const InstanceBox = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.paper,
    minWidth: 160,
}));

const Caption = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    fontFamily: 'monospace',
}));

const Component = ({
    name,
    file,
    children,
}: {
    name: string;
    file: string;
    children: ReactNode;
}) => (
    <Section>
        <SectionTitle>
            {name}
            <SectionMeta>{file}</SectionMeta>
        </SectionTitle>
        <Matrix>{children}</Matrix>
    </Section>
);

const Instance = ({
    caption,
    children,
}: {
    caption: string;
    children: ReactNode;
}) => (
    <InstanceBox>
        <div>{children}</div>
        <Caption>{caption}</Caption>
    </InstanceBox>
);

/**
 * Authorization-gated components (PermissionButton, PermissionIconButton,
 * ResponsiveButton, CreateButton, UpdateButton) call the access hooks which
 * read from AccessContext. To show their ENABLED look by default we wrap them
 * in the app's own AccessContext with a dev-user that always has access.
 */
const grantAllAccess: IAccessContext = {
    isAdmin: true,
    hasAccess: () => true,
};

const WithAccess = ({ children }: { children: ReactNode }) => (
    <AccessContext.Provider value={grantAllAccess}>
        {children}
    </AccessContext.Provider>
);

// --- Sample data ----------------------------------------------------------
const sampleUser = { name: 'Ada Lovelace', email: 'ada@example.com' };

const badgeColors = [
    'info',
    'success',
    'warning',
    'error',
    'primary',
    'secondary',
    'neutral',
    'disabled',
] as const;

// --- Interactive wrappers (need local state) ------------------------------
const DialogueDemo = ({
    maxWidth,
}: {
    maxWidth?: 'lg' | 'sm' | 'xs' | 'md' | 'xl';
}) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <PermissionButton permission='ADMIN' onClick={() => setOpen(true)}>
                Open dialogue
            </PermissionButton>
            <Dialogue
                open={open}
                title='Delete this flag?'
                primaryButtonText='Delete'
                secondaryButtonText='Cancel'
                maxWidth={maxWidth}
                onClick={() => setOpen(false)}
                onClose={() => setOpen(false)}
            >
                This action cannot be undone.
            </Dialogue>
        </>
    );
};

const SidebarModalDemo = () => {
    const [open, setOpen] = useState(false);
    return (
        <WithAccess>
            <PermissionButton permission='ADMIN' onClick={() => setOpen(true)}>
                Open sidebar
            </PermissionButton>
            <SidebarModal
                open={open}
                onClose={() => setOpen(false)}
                label='Details panel'
            >
                <Box sx={{ p: 4 }}>
                    <Typography variant='h2'>Panel content</Typography>
                    <Typography>Self-contained sidebar body.</Typography>
                </Box>
            </SidebarModal>
        </WithAccess>
    );
};

export const Gallery = () => {
    return (
        <Page>
            <div>
                <Typography variant='h1'>Component Gallery</Typography>
                <Typography color='text.secondary'>
                    Every cataloged design-system component and its state
                    matrix. Dev-only route.
                </Typography>
            </div>

            {/* ============================ INPUT ============================ */}
            <CategoryHeading as='h2'>Input</CategoryHeading>

            <Component name='Input' file='common/Input'>
                <Instance caption='default'>
                    <Input
                        label='Flag name'
                        value='my-feature'
                        onChange={noop}
                    />
                </Instance>
                <Instance caption='required'>
                    <Input
                        label='Flag name'
                        value='my-feature'
                        onChange={noop}
                        required
                    />
                </Instance>
                <Instance caption='error'>
                    <Input
                        label='Flag name'
                        value='bad name'
                        onChange={noop}
                        error
                        errorText='No spaces allowed'
                    />
                </Instance>
                <Instance caption='disabled'>
                    <Input
                        label='Flag name'
                        value='my-feature'
                        onChange={noop}
                        disabled
                    />
                </Instance>
                <Instance caption='multiline'>
                    <Input
                        label='Description'
                        value={'Line one\nLine two'}
                        onChange={noop}
                        multiline
                        rows={3}
                    />
                </Instance>
            </Component>

            <Component name='General Select' file='common/GeneralSelect'>
                {(['outlined', 'filled', 'standard'] as const).map(
                    (variant) => (
                        <Instance key={variant} caption={`variant=${variant}`}>
                            <GeneralSelect
                                label='Type'
                                value='release'
                                variant={variant}
                                onChange={noop}
                                options={[
                                    { key: 'release', label: 'Release' },
                                    { key: 'experiment', label: 'Experiment' },
                                ]}
                            />
                        </Instance>
                    ),
                )}
                <Instance caption='fullWidth'>
                    <Box sx={{ width: 220 }}>
                        <GeneralSelect
                            label='Type'
                            value='release'
                            fullWidth
                            onChange={noop}
                            options={[{ key: 'release', label: 'Release' }]}
                        />
                    </Box>
                </Instance>
                <Instance caption='visuallyHideLabel'>
                    <GeneralSelect
                        label='Type'
                        value='release'
                        visuallyHideLabel
                        onChange={noop}
                        options={[{ key: 'release', label: 'Release' }]}
                    />
                </Instance>
                <Instance caption='disabled'>
                    <GeneralSelect
                        label='Type'
                        value='release'
                        disabled
                        onChange={noop}
                        options={[{ key: 'release', label: 'Release' }]}
                    />
                </Instance>
            </Component>

            <Component name='Select Field' file='common/SelectField'>
                <Instance caption='default'>
                    <SelectField
                        label='Strategy'
                        value='gradual'
                        onChange={noop}
                        options={[
                            { key: 'gradual', label: 'Gradual rollout' },
                            { key: 'standard', label: 'Standard' },
                        ]}
                    />
                </Instance>
                <Instance caption='disabled'>
                    <SelectField
                        label='Strategy'
                        value='gradual'
                        onChange={noop}
                        disabled
                        options={[{ key: 'gradual', label: 'Gradual rollout' }]}
                    />
                </Instance>
            </Component>

            <Component
                name='Autocomplete Field'
                file='common/AutocompleteField'
            >
                <Instance caption='default'>
                    <AutocompleteField
                        label='Environment'
                        options={['development', 'production']}
                    />
                </Instance>
                <Instance caption='required'>
                    <AutocompleteField
                        label='Environment'
                        options={['development', 'production']}
                        required
                    />
                </Instance>
                <Instance caption='error'>
                    <AutocompleteField
                        label='Environment'
                        options={['development', 'production']}
                        error
                        helperText='Please pick one'
                    />
                </Instance>
                <Instance caption='disabled'>
                    <AutocompleteField
                        label='Environment'
                        options={['development', 'production']}
                        disabled
                    />
                </Instance>
            </Component>

            <Component name='Password Field' file='common/PasswordField'>
                <Instance caption='default'>
                    <PasswordField
                        label='Password'
                        value='hunter2'
                        onChange={noop}
                    />
                </Instance>
                <Instance caption='required'>
                    <PasswordField
                        label='Password'
                        value='hunter2'
                        onChange={noop}
                        required
                    />
                </Instance>
                <Instance caption='error'>
                    <PasswordField
                        label='Password'
                        value='short'
                        onChange={noop}
                        error
                        helperText='Too short'
                    />
                </Instance>
                <Instance caption='disabled'>
                    <PasswordField
                        label='Password'
                        value='hunter2'
                        onChange={noop}
                        disabled
                    />
                </Instance>
            </Component>

            <Component name='Search' file='common/Search'>
                <Instance caption='default'>
                    <Search onChange={noop} />
                </Instance>
                <Instance caption='hasFilters'>
                    <Search onChange={noop} hasFilters />
                </Instance>
                <Instance caption='expandable'>
                    <Search onChange={noop} expandable />
                </Instance>
                <Instance caption='disabled'>
                    <Search onChange={noop} disabled />
                </Instance>
            </Component>

            {/* Authorization-gated inputs: wrapped so they render ENABLED. */}
            <WithAccess>
                <Component
                    name='Permission Button'
                    file='common/PermissionButton'
                >
                    {(['contained', 'outlined', 'text'] as const).map(
                        (variant) => (
                            <Instance
                                key={variant}
                                caption={`variant=${variant}`}
                            >
                                <PermissionButton
                                    permission='ADMIN'
                                    onClick={noop}
                                    variant={variant}
                                >
                                    Save
                                </PermissionButton>
                            </Instance>
                        ),
                    )}
                    <Instance caption='color=primary'>
                        <PermissionButton
                            permission='ADMIN'
                            onClick={noop}
                            color='primary'
                        >
                            Save
                        </PermissionButton>
                    </Instance>
                    <Instance caption='disabled'>
                        <PermissionButton
                            permission='ADMIN'
                            onClick={noop}
                            disabled
                        >
                            Save
                        </PermissionButton>
                    </Instance>
                    <Instance caption='hideLockIcon (locked variant)'>
                        {/* Explicitly-locked cell: no access provider here, so the
                            access check fails and the designed locked look shows,
                            with the lock icon suppressed via hideLockIcon. */}
                        <AccessContext.Provider
                            value={{ isAdmin: false, hasAccess: () => false }}
                        >
                            <PermissionButton
                                permission='ADMIN'
                                onClick={noop}
                                hideLockIcon
                            >
                                Save
                            </PermissionButton>
                        </AccessContext.Provider>
                    </Instance>
                </Component>

                <Component
                    name='Permission Icon Button'
                    file='common/PermissionIconButton'
                >
                    {(['small', 'medium', 'large'] as const).map((size) => (
                        <Instance key={size} caption={`size=${size}`}>
                            <PermissionIconButton
                                permission='ADMIN'
                                onClick={noop}
                                size={size}
                            >
                                <EditIcon />
                            </PermissionIconButton>
                        </Instance>
                    ))}
                    <Instance caption='disabled'>
                        <PermissionIconButton
                            permission='ADMIN'
                            onClick={noop}
                            disabled
                        >
                            <EditIcon />
                        </PermissionIconButton>
                    </Instance>
                </Component>

                <Component
                    name='Responsive Button'
                    file='common/ResponsiveButton'
                >
                    {(['contained', 'outlined', 'text'] as const).map(
                        (variant) => (
                            <Instance
                                key={variant}
                                caption={`variant=${variant}`}
                            >
                                <ResponsiveButton
                                    Icon={AddIcon}
                                    onClick={noop}
                                    permission='ADMIN'
                                    maxWidth='700px'
                                    variant={variant}
                                >
                                    New item
                                </ResponsiveButton>
                            </Instance>
                        ),
                    )}
                    <Instance caption='disabled'>
                        <ResponsiveButton
                            Icon={AddIcon}
                            onClick={noop}
                            permission='ADMIN'
                            maxWidth='700px'
                            disabled
                        >
                            New item
                        </ResponsiveButton>
                    </Instance>
                </Component>

                <Component name='Create Button' file='common/CreateButton'>
                    <Instance caption='default'>
                        <CreateButton
                            name='flag'
                            permission='ADMIN'
                            onClick={noop}
                        />
                    </Instance>
                    <Instance caption='disabled'>
                        <CreateButton
                            name='flag'
                            permission='ADMIN'
                            onClick={noop}
                            disabled
                        />
                    </Instance>
                </Component>

                <Component name='Update Button' file='common/UpdateButton'>
                    <Instance caption='default'>
                        <UpdateButton permission='ADMIN' onClick={noop} />
                    </Instance>
                    <Instance caption='disabled'>
                        <UpdateButton
                            permission='ADMIN'
                            onClick={noop}
                            disabled
                        />
                    </Instance>
                </Component>
            </WithAccess>

            {/* ============================ DISPLAY ========================== */}
            <CategoryHeading as='h2'>Display</CategoryHeading>

            <Component name='Badge' file='common/Badge'>
                {badgeColors.map((color) => (
                    <Instance key={color} caption={`color=${color}`}>
                        <Badge color={color}>{color}</Badge>
                    </Instance>
                ))}
                <Instance caption='round'>
                    <Badge color='success' round>
                        3
                    </Badge>
                </Instance>
                <Instance caption='iconRight'>
                    <Badge color='info' icon={<AddIcon />} iconRight>
                        New
                    </Badge>
                </Instance>
            </Component>

            <Component name='User Avatar' file='common/UserAvatar'>
                <Instance caption='default'>
                    <UserAvatar user={sampleUser} />
                </Instance>
                <Instance caption='disableTooltip'>
                    <UserAvatar user={sampleUser} disableTooltip />
                </Instance>
            </Component>

            <Component name='Truncator' file='common/Truncator'>
                <Instance caption='default (1 line)'>
                    <Box sx={{ width: 140 }}>
                        <Truncator title='This is a long label that truncates'>
                            This is a long label that truncates
                        </Truncator>
                    </Box>
                </Instance>
                <Instance caption='arrow'>
                    <Box sx={{ width: 140 }}>
                        <Truncator arrow title='Long tooltip text'>
                            Another long value to truncate here
                        </Truncator>
                    </Box>
                </Instance>
            </Component>

            <Component
                name='Strategy Evaluation Chip'
                file='common/ConstraintsList/StrategyEvaluationChip'
            >
                <Instance caption='default'>
                    <StrategyEvaluationChip label='userId is one of 42' />
                </Instance>
                <Instance caption='multiline'>
                    <Box sx={{ width: 160 }}>
                        <StrategyEvaluationChip
                            multiline
                            label='userId is one of a very long list of values'
                        />
                    </Box>
                </Instance>
            </Component>

            <Component
                name='Playground Result Chip'
                file='playground/.../PlaygroundResultChip'
            >
                <Instance caption='enabled=true'>
                    <PlaygroundResultChip enabled label='True' />
                </Instance>
                <Instance caption='enabled=false'>
                    <PlaygroundResultChip enabled={false} label='False' />
                </Instance>
                <Instance caption="enabled='unevaluated'">
                    <PlaygroundResultChip
                        enabled='unevaluated'
                        label='Unevaluated'
                    />
                </Instance>
                <Instance caption="enabled='unknown'">
                    <PlaygroundResultChip enabled='unknown' label='Unknown' />
                </Instance>
                <Instance caption='showIcon=false'>
                    <PlaygroundResultChip
                        enabled
                        label='True'
                        showIcon={false}
                    />
                </Instance>
            </Component>

            <Component name='Text Cell' file='common/Table/cells/TextCell'>
                <Instance caption='value'>
                    <TextCell value='Some cell text' />
                </Instance>
                <Instance caption='children'>
                    <TextCell>Custom child text</TextCell>
                </Instance>
            </Component>

            {/* ============================ FEEDBACK ========================= */}
            <CategoryHeading as='h2'>Feedback</CategoryHeading>

            <Component name='Dialogue' file='common/Dialogue'>
                {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((maxWidth) => (
                    <Instance key={maxWidth} caption={`maxWidth=${maxWidth}`}>
                        <WithAccess>
                            <DialogueDemo maxWidth={maxWidth} />
                        </WithAccess>
                    </Instance>
                ))}
            </Component>

            <Component name='Banner' file='banners/Banner'>
                {(['info', 'warning', 'error', 'success'] as const).map(
                    (variant) => (
                        <Instance key={variant} caption={`variant=${variant}`}>
                            <Box sx={{ width: 320 }}>
                                <Banner
                                    inline
                                    banner={{
                                        message: `This is a ${variant} banner.`,
                                        variant,
                                    }}
                                />
                            </Box>
                        </Instance>
                    ),
                )}
                <Instance caption='inline=false (page-width)'>
                    <Box sx={{ width: 320 }}>
                        <Banner
                            banner={{
                                message: 'A full-width banner.',
                                variant: 'info',
                            }}
                        />
                    </Box>
                </Instance>
            </Component>

            <Component name='Loader' file='common/Loader'>
                <Instance caption='type=inline'>
                    <Box sx={{ height: 80, position: 'relative' }}>
                        <Loader type='inline' />
                    </Box>
                </Instance>
            </Component>

            <Component name='HTML Tooltip' file='common/HtmlTooltip'>
                <Instance caption='default'>
                    <HtmlTooltip title='Rich tooltip content'>
                        <span>Hover me</span>
                    </HtmlTooltip>
                </Instance>
                <Instance caption='arrow'>
                    <HtmlTooltip title='Rich tooltip content' arrow>
                        <span>Hover me</span>
                    </HtmlTooltip>
                </Instance>
            </Component>

            <Component name='Tooltip Resolver' file='common/TooltipResolver'>
                <Instance caption='variant=default'>
                    <TooltipResolver title='Simple tip'>
                        <span>Hover me</span>
                    </TooltipResolver>
                </Instance>
                <Instance caption='variant=custom'>
                    <TooltipResolver variant='custom' title='Custom tip'>
                        <span>Hover me</span>
                    </TooltipResolver>
                </Instance>
                <Instance caption='arrow'>
                    <TooltipResolver title='With arrow' arrow>
                        <span>Hover me</span>
                    </TooltipResolver>
                </Instance>
            </Component>

            <Component name='Help Icon' file='common/HelpIcon'>
                <Instance caption='default'>
                    <HelpIcon tooltip='Explains this field' />
                </Instance>
                <Instance caption='htmlTooltip'>
                    <HelpIcon
                        htmlTooltip
                        tooltip={<div>Rich help content</div>}
                    />
                </Instance>
            </Component>

            {/* ============================ LAYOUT =========================== */}
            <CategoryHeading as='h2'>Layout</CategoryHeading>

            <Component name='Page Content' file='common/PageContent'>
                <Instance caption='default'>
                    <Box sx={{ width: 320 }}>
                        <PageContent
                            header={<PageHeader secondary title='Section' />}
                        >
                            Body of the page content.
                        </PageContent>
                    </Box>
                </Instance>
                <Instance caption='isLoading'>
                    <Box sx={{ width: 320 }}>
                        <PageContent
                            header={<PageHeader secondary title='Loading' />}
                            isLoading
                        >
                            Loading skeleton.
                        </PageContent>
                    </Box>
                </Instance>
                <Instance caption='disableLoading'>
                    <Box sx={{ width: 320 }}>
                        <PageContent
                            header={<PageHeader secondary title='Section' />}
                            disableLoading
                        >
                            Body without loading overlay.
                        </PageContent>
                    </Box>
                </Instance>
            </Component>

            <Component name='Page Header' file='common/PageHeader'>
                <Instance caption='secondary'>
                    <PageHeader secondary title='Feature flags' />
                </Instance>
                <Instance caption='loading'>
                    <PageHeader secondary title='Loading' loading />
                </Instance>
            </Component>

            <Component name='Form Field' file='common/FormField'>
                <Instance caption='default'>
                    <FormField label='Custom control'>
                        <Input label='Nested' value='value' onChange={noop} />
                    </FormField>
                </Instance>
            </Component>

            <Component name='Form Template' file='common/FormTemplate'>
                <Instance caption='default'>
                    <Box sx={{ maxWidth: 520 }}>
                        <FormTemplate
                            title='Create flag'
                            description='Fill in the details to create a flag.'
                        >
                            <Input
                                label='Name'
                                value='my-flag'
                                onChange={noop}
                            />
                        </FormTemplate>
                    </Box>
                </Instance>
                <Instance caption='compact'>
                    <Box sx={{ maxWidth: 520 }}>
                        <FormTemplate
                            compact
                            title='Compact form'
                            description='A compact variant.'
                        >
                            <Input
                                label='Name'
                                value='my-flag'
                                onChange={noop}
                            />
                        </FormTemplate>
                    </Box>
                </Instance>
                <Instance caption='loading'>
                    <Box sx={{ maxWidth: 520 }}>
                        <FormTemplate
                            loading
                            title='Loading form'
                            description='Loading state.'
                        >
                            <Input
                                label='Name'
                                value='my-flag'
                                onChange={noop}
                            />
                        </FormTemplate>
                    </Box>
                </Instance>
            </Component>

            <Component name='Sidebar Modal' file='common/SidebarModal'>
                <Instance caption='open toggled by button'>
                    <SidebarModalDemo />
                </Instance>
            </Component>
        </Page>
    );
};

export default Gallery;

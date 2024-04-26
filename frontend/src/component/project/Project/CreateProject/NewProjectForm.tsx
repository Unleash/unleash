import { Input, TextField, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';

const StyledContainer = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,

    '> * + *' : {
        borderBlockStart: `1px solid ${theme.palette.divider}`,
    },

    '> *' : {
    padding: theme.spacing(7),
    },


}));


const TopGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: '"icon header template" "icon project-name project-name" "icon description description"',
    gridTemplateColumns: 'minmax(auto, 50px) 1fr auto',
    gap: theme.spacing(2),

    '> span.icon': {
        border: `1px solid ${theme.palette.primary.main}`,
        width: `100%`,
        aspectRatio: '1',
        borderRadius: theme.shape.borderRadius,
    },

    '> h2' : {
        gridArea: 'header',
    },

    '> span.input' : {
        gridArea: 'template',

    },

    '.project-name' : {
        gridArea: 'project-name',
        margin: 0,
    },

    '.project-name *' : {
        fontSize: theme.typography.h1.fontSize,
    },

    '.description' : {
        gridArea: 'description',
        margin: 0,
    },

    '.description *' : {
        fontSize: theme.typography.h2.fontSize,
    },

}));

const OptionButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const StyledInput = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
    paddingRight: theme.spacing(1),

    fieldset: {border: 'none'},
}));

export const NewProjectForm = () => {
  return (
      <FormTemplate

    description="Create a new project"
    documentationLink='docs link'
    documentationLinkLabel='docs label'
    disablePadding

          >      <StyledContainer>
          <TopGrid>
            <span className="icon">icon</span>
          <typography variant='h2'>New project</typography><span className="input">no template</span>
          <StyledInput
      className='project-name'
      label="Project name"
      // autoFocus
      required
      InputProps= {{
          classes: {input: 'project-name-input', label: 'project-name-input'},
      }}
          />
          <StyledInput
      className='description'
      label="Description (optional)"
      multiline
      // autoFocus
          />
          </TopGrid>
          <OptionButtons><button>option</button>
          <button>option</button>
          <button>option</button>
          <button>option</button></OptionButtons>
          <div><button>cancel/create</button>
          <button>cancel/create</button></div>
          </StyledContainer>
</FormTemplate>  );
};

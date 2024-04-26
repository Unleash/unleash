import { styled } from '@mui/material';
import React from 'react';

const StyledContainer = styled('article')(({ theme }) => ({
    background: theme.palette.background.default,

    '> * + *' : {
        borderBlockStart: '1px solid black',
    },

    '> *' : {
    padding: theme.spacing(7),
    },


}));


const TopGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: '"icon header template" "icon title title" "icon description description"',
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

    '> label:first-of-type' : {
        gridArea: 'title',
    },

    '> label:last-of-type' : {
        gridArea: 'description',
    },

}));

const OptionButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

export const NewProjectForm = () => {
  return (
      <StyledContainer>
          <TopGrid>
            <span className="icon">icon</span>
          <h2>New project</h2><span className="input">no template</span>
          <label >Project name<input name="" type="text" value=""/></label>
          <label>Description<input name="" type="text" value=""/></label>
          </TopGrid>
          <OptionButtons><button>option</button>
          <button>option</button>
          <button>option</button>
          <button>option</button></OptionButtons>
          <div><button>cancel/create</button>
          <button>cancel/create</button></div>
          </StyledContainer>
  );
};

/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Grid, TextField, Box } from '@mui/material';
import SectionCard from './SectionCard';
import RichTextEditor from './RichTextEditor';

const EducationForm = ({ item, sectionId, onUpdate, onRemove }) => (
  <SectionCard title="Education Entry" onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Degree / Certification"
          value={item.data.title || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'title', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Institution"
          value={item.data.subtitle || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'subtitle', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date (e.g., 2020 - 2024)"
          value={item.data.date || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'date', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Location"
          value={item.data.location || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'location', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 1 }}>Description / GPA / Achievements</Box>
        <RichTextEditor
          value={item.data.description || ''}
          onChange={(html) => onUpdate(sectionId, item.id, 'description', html)}
          minHeight={80}
        />
      </Grid>
    </Grid>
  </SectionCard>
);

const ExperienceForm = ({ item, sectionId, onUpdate, onRemove }) => (
  <SectionCard title="Experience Entry" onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Job Title"
          value={item.data.title || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'title', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Company"
          value={item.data.subtitle || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'subtitle', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date (e.g., Jan 2023 - Present)"
          value={item.data.date || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'date', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Location"
          value={item.data.location || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'location', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 1 }}>Responsibilities & Achievements</Box>
        <RichTextEditor
          value={item.data.description || ''}
          onChange={(html) => onUpdate(sectionId, item.id, 'description', html)}
          minHeight={100}
        />
      </Grid>
    </Grid>
  </SectionCard>
);

const SkillsForm = ({ item, sectionId, onUpdate, onRemove }) => (
  <SectionCard title="Skill Category" onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Category (e.g., Languages, Frameworks)"
          value={item.data.title || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'title', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 1 }}>Skills (comma-separated or list)</Box>
        <RichTextEditor
          value={item.data.description || ''}
          onChange={(html) => onUpdate(sectionId, item.id, 'description', html)}
          minHeight={60}
        />
      </Grid>
    </Grid>
  </SectionCard>
);

const ProjectsForm = ({ item, sectionId, onUpdate, onRemove }) => (
  <SectionCard title="Project Entry" onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Project Name"
          value={item.data.title || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'title', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Technologies / Role"
          value={item.data.subtitle || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'subtitle', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Date"
          value={item.data.date || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'date', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 1 }}>Project Description & Highlights</Box>
        <RichTextEditor
          value={item.data.description || ''}
          onChange={(html) => onUpdate(sectionId, item.id, 'description', html)}
          minHeight={80}
        />
      </Grid>
    </Grid>
  </SectionCard>
);

const GenericForm = ({ item, sectionId, sectionName, onUpdate, onRemove }) => (
  <SectionCard title={`${sectionName} Entry`} onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Title"
          value={item.data.title || ''}
          onChange={(e) => onUpdate(sectionId, item.id, 'title', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 1 }}>Details</Box>
        <RichTextEditor
          value={item.data.description || ''}
          onChange={(html) => onUpdate(sectionId, item.id, 'description', html)}
          minHeight={80}
        />
      </Grid>
    </Grid>
  </SectionCard>
);

export const renderSectionForm = (section, onUpdate, onRemove) => {
  const props = {
    sectionId: section.id,
    onUpdate,
    onRemove: (itemId) => onRemove(section.id, itemId),
  };

  const formMap = {
    education: EducationForm,
    experience: ExperienceForm,
    skills: SkillsForm,
    projects: ProjectsForm,
  };

  const FormComponent = formMap[section.id] || GenericForm;

  return section.items.map((item) => (
    <FormComponent
      key={item.id}
      item={item}
      sectionName={section.name}
      {...props}
      onRemove={() => props.onRemove(item.id)}
    />
  ));
};

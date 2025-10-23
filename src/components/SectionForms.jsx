/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { Grid, TextField, Box, Button } from "@mui/material";
import SectionCard from "./SectionCard";
import RichTextEditor from "./RichTextEditor";
import SortableItem from "./SortableItem";

const EducationForm = ({
  item,
  sectionId,
  onUpdate,
  onRemove,
  onToggleCollapsed,
}) => (
  <SectionCard title="Education Entry" onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Degree / Certification"
          value={item.data.title || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "title", e.target.value)
          }
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Institution"
          value={item.data.subtitle || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "subtitle", e.target.value)
          }
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date (e.g., 2020 - 2024)"
          value={item.data.date || ""}
          onChange={(e) => onUpdate(sectionId, item.id, "date", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Location"
          value={item.data.location || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "location", e.target.value)
          }
        />
      </Grid>
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ typography: "caption", color: "text.secondary", my: 1 }}>
        Description / GPA / Achievements
      </Box>
      <RichTextEditor
        value={item.data.description || ""}
        onChange={(html) => onUpdate(sectionId, item.id, "description", html)}
        minHeight={80}
      />
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onToggleCollapsed(sectionId, item.id)}
        >
          Done
        </Button>
      </Box>
    </Grid>
  </SectionCard>
);

const ExperienceForm = ({
  item,
  sectionId,
  onUpdate,
  onRemove,
  onToggleCollapsed,
}) => (
  <SectionCard title="Experience Entry" onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Job Title"
          value={item.data.title || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "title", e.target.value)
          }
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Company"
          value={item.data.subtitle || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "subtitle", e.target.value)
          }
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date (e.g., Jan 2023 - Present)"
          value={item.data.date || ""}
          onChange={(e) => onUpdate(sectionId, item.id, "date", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Location"
          value={item.data.location || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "location", e.target.value)
          }
        />
      </Grid>
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ typography: "caption", color: "text.secondary", my: 1 }}>
        Responsibilities & Achievements
      </Box>
      <RichTextEditor
        value={item.data.description || ""}
        onChange={(html) => onUpdate(sectionId, item.id, "description", html)}
        minHeight={100}
      />
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onToggleCollapsed(sectionId, item.id)}
        >
          Done
        </Button>
      </Box>
    </Grid>
  </SectionCard>
);

const SkillsForm = ({
  item,
  sectionId,
  onUpdate,
  onRemove,
  onToggleCollapsed,
}) => (
  <SectionCard title="Skill Category" onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Category (e.g., Languages, Frameworks)"
          value={item.data.title || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "title", e.target.value)
          }
        />
      </Grid>
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ typography: "caption", color: "text.secondary", my: 1 }}>
        Skills (comma-separated or list)
      </Box>
      <RichTextEditor
        value={item.data.description || ""}
        onChange={(html) => onUpdate(sectionId, item.id, "description", html)}
        minHeight={60}
      />
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onToggleCollapsed(sectionId, item.id)}
        >
          Done
        </Button>
      </Box>
    </Grid>
  </SectionCard>
);

const ProjectsForm = ({
  item,
  sectionId,
  onUpdate,
  onRemove,
  onToggleCollapsed,
}) => (
  <SectionCard title="Project Entry" onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Project Name"
          value={item.data.title || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "title", e.target.value)
          }
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Technologies / Role"
          value={item.data.subtitle || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "subtitle", e.target.value)
          }
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Date"
          value={item.data.date || ""}
          onChange={(e) => onUpdate(sectionId, item.id, "date", e.target.value)}
        />
      </Grid>
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ typography: "caption", color: "text.secondary", my: 1 }}>
        Project Description & Highlights
      </Box>
      <RichTextEditor
        value={item.data.description || ""}
        onChange={(html) => onUpdate(sectionId, item.id, "description", html)}
        minHeight={80}
      />
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onToggleCollapsed(sectionId, item.id)}
        >
          Done
        </Button>
      </Box>
    </Grid>
  </SectionCard>
);

const GenericForm = ({
  item,
  sectionId,
  sectionName,
  onUpdate,
  onRemove,
  onToggleCollapsed,
}) => (
  <SectionCard title={`${sectionName} Entry`} onRemove={onRemove}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Title"
          value={item.data.title || ""}
          onChange={(e) =>
            onUpdate(sectionId, item.id, "title", e.target.value)
          }
        />
      </Grid>
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ typography: "caption", color: "text.secondary", my: 1 }}>
        Details
      </Box>
      <RichTextEditor
        value={item.data.description || ""}
        onChange={(html) => onUpdate(sectionId, item.id, "description", html)}
        minHeight={80}
      />
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onToggleCollapsed(sectionId, item.id)}
        >
          Done
        </Button>
      </Box>
    </Grid>
  </SectionCard>
);

export const renderSectionForm = (
  section,
  onUpdate,
  onRemove,
  onToggleCollapsed
) => {
  const onRemoveLocal = (itemId) => onRemove(section.id, itemId);

  const formMap = {
    education: EducationForm,
    experience: ExperienceForm,
    skills: SkillsForm,
    projects: ProjectsForm,
  };

  const FormComponent = formMap[section.id] || GenericForm;

  return section.items.map((item) => (
    <SortableItem
      key={item.id}
      item={item}
      section={section}
      onToggleCollapsed={onToggleCollapsed}
    >
      <FormComponent
        item={item}
        sectionName={section.name}
        sectionId={section.id}
        onUpdate={onUpdate}
        onRemove={() => onRemoveLocal(item.id)}
        onToggleCollapsed={onToggleCollapsed}
      />
    </SortableItem>
  ));
};

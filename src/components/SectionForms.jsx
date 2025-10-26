/* eslint-disable react-refresh/only-export-components */
import React from "react";
import {
  Grid,
  TextField,
  Box,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import SectionCard from "./SectionCard";
import RichTextEditor from "./RichTextEditor";
import SortableItem from "./SortableItem";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const EducationForm = ({
  item,
  sectionId,
  onUpdate,
  onRemove,
  onToggleCollapsed,
  onOpenUrlDialog,
}) => (
  <SectionCard title="Education Entry" onRemove={onRemove}>
    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Degree / Certification"
        value={item.data.title || ""}
        onChange={(e) => onUpdate(sectionId, item.id, "title", e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenUrlDialog &&
                  onOpenUrlDialog({
                    sectionId,
                    itemId: item.id,
                    field: "title",
                  })
                }
                title="Add link"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Grid>
    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Institution"
        value={item.data.subtitle || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "subtitle", e.target.value)
        }
      />
    </Grid>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date (e.g., 2020)"
          value={item.data.startDate || ""}
          onChange={(e) => {
            const start = e.target.value;
            const end = item.data.endDate || "";
            onUpdate(sectionId, item.id, "startDate", start);
            onUpdate(
              sectionId,
              item.id,
              "date",
              end ? `${start} - ${end}` : start
            );
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Date (e.g., 2024 or Present)"
          value={item.data.endDate || ""}
          onChange={(e) => {
            const end = e.target.value;
            const start = item.data.startDate || "";
            onUpdate(sectionId, item.id, "endDate", end);
            onUpdate(
              sectionId,
              item.id,
              "date",
              start ? `${start} - ${end}` : end
            );
          }}
        />
      </Grid>
    </Grid>
    <Grid item xs={12} sm={6} marginTop={2}>
      <TextField
        fullWidth
        label="Location"
        value={item.data.location || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "location", e.target.value)
        }
      />
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
  onOpenUrlDialog,
}) => (
  <SectionCard title="Experience Entry" onRemove={onRemove}>
    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Job Title"
        value={item.data.title || ""}
        onChange={(e) => onUpdate(sectionId, item.id, "title", e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenUrlDialog &&
                  onOpenUrlDialog({
                    sectionId,
                    itemId: item.id,
                    field: "title",
                  })
                }
                title="Add link"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Grid>
    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Company"
        value={item.data.subtitle || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "subtitle", e.target.value)
        }
      />
    </Grid>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date (e.g., Jan 2023)"
          value={item.data.startDate || ""}
          onChange={(e) => {
            const start = e.target.value;
            const end = item.data.endDate || "";
            onUpdate(sectionId, item.id, "startDate", start);
            onUpdate(
              sectionId,
              item.id,
              "date",
              end ? `${start} - ${end}` : start
            );
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Date (e.g., Present)"
          value={item.data.endDate || ""}
          onChange={(e) => {
            const end = e.target.value;
            const start = item.data.startDate || "";
            onUpdate(sectionId, item.id, "endDate", end);
            onUpdate(
              sectionId,
              item.id,
              "date",
              start ? `${start} - ${end}` : end
            );
          }}
        />
      </Grid>
    </Grid>
    <Grid item xs={12} sm={6} marginTop={2}>
      <TextField
        fullWidth
        label="Location"
        value={item.data.location || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "location", e.target.value)
        }
      />
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
  onOpenUrlDialog,
}) => (
  <SectionCard title="Skill Category" onRemove={onRemove}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Category (e.g., Languages, Frameworks)"
        value={item.data.title || ""}
        onChange={(e) => onUpdate(sectionId, item.id, "title", e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenUrlDialog &&
                  onOpenUrlDialog({
                    sectionId,
                    itemId: item.id,
                    field: "title",
                  })
                }
                title="Add link"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
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
  onOpenUrlDialog,
}) => (
  <SectionCard title="Project Entry" onRemove={onRemove}>
    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Project Name"
        value={item.data.title || ""}
        onChange={(e) => onUpdate(sectionId, item.id, "title", e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenUrlDialog &&
                  onOpenUrlDialog({
                    sectionId,
                    itemId: item.id,
                    field: "title",
                  })
                }
                title="Add link"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Grid>
    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Subtitle"
        value={item.data.subtitle || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "subtitle", e.target.value)
        }
      />
    </Grid>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date"
          value={item.data.startDate || ""}
          onChange={(e) => {
            const start = e.target.value;
            const end = item.data.endDate || "";
            onUpdate(sectionId, item.id, "startDate", start);
            onUpdate(
              sectionId,
              item.id,
              "date",
              end ? `${start} - ${end}` : start
            );
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Date"
          value={item.data.endDate || ""}
          onChange={(e) => {
            const end = e.target.value;
            const start = item.data.startDate || "";
            onUpdate(sectionId, item.id, "endDate", end);
            onUpdate(
              sectionId,
              item.id,
              "date",
              start ? `${start} - ${end}` : end
            );
          }}
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

const PublicationForm = ({
  item,
  sectionId,
  onUpdate,
  onRemove,
  onToggleCollapsed,
  onOpenUrlDialog,
}) => (
  <SectionCard title="Publication Entry" onRemove={onRemove}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Title"
        value={item.data.title || ""}
        onChange={(e) => onUpdate(sectionId, item.id, "title", e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenUrlDialog &&
                  onOpenUrlDialog({
                    sectionId,
                    itemId: item.id,
                    field: "title",
                  })
                }
                title="Add link"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Grid>
    {/* // publisher field */}
    <Grid item xs={12} marginTop={2} marginBottom={2}>
      <TextField
        fullWidth
        label="Publisher"
        value={item.data.publisher || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "publisher", e.target.value)
        }
      />
    </Grid>
    {/* publication date */}
    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Publication Date"
        value={item.data.publicationDate || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "publicationDate", e.target.value)
        }
      />
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

const CoursesForm = ({
  item,
  sectionId,
  onUpdate,
  onRemove,
  onToggleCollapsed,
  onOpenUrlDialog,
}) => (
  <SectionCard title="Course Entry" onRemove={onRemove}>
    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Course Name"
        value={item.data.title || ""}
        onChange={(e) => onUpdate(sectionId, item.id, "title", e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenUrlDialog &&
                  onOpenUrlDialog({
                    sectionId,
                    itemId: item.id,
                    field: "title",
                  })
                }
                title="Add link"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Grid>

    <Grid item xs={12} marginBottom={2}>
      <TextField
        fullWidth
        label="Institution"
        value={item.data.subtitle || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "subtitle", e.target.value)
        }
      />
    </Grid>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date (e.g., 2020)"
          value={item.data.startDate || ""}
          onChange={(e) => {
            const start = e.target.value;
            const end = item.data.endDate || "";
            onUpdate(sectionId, item.id, "startDate", start);
            onUpdate(
              sectionId,
              item.id,
              "date",
              end ? `${start} - ${end}` : start
            );
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Date (e.g., 2024 or Present)"
          value={item.data.endDate || ""}
          onChange={(e) => {
            const end = e.target.value;
            const start = item.data.startDate || "";
            onUpdate(sectionId, item.id, "endDate", end);
            onUpdate(
              sectionId,
              item.id,
              "date",
              start ? `${start} - ${end}` : end
            );
          }}
        />
      </Grid>
    </Grid>
    <Grid item xs={12} sm={6} marginTop={2}>
      <TextField
        fullWidth
        label="Location"
        value={item.data.location || ""}
        onChange={(e) =>
          onUpdate(sectionId, item.id, "location", e.target.value)
        }
      />
    </Grid>
    <Grid item xs={12}>
      <Box sx={{ typography: "caption", color: "text.secondary", my: 1 }}>
        Description
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
  onOpenUrlDialog,
}) => (
  <SectionCard title={`${sectionName} Entry`} onRemove={onRemove}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Title"
        value={item.data.title || ""}
        onChange={(e) => onUpdate(sectionId, item.id, "title", e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenUrlDialog &&
                  onOpenUrlDialog({
                    sectionId,
                    itemId: item.id,
                    field: "title",
                  })
                }
                title="Add link"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
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
  onToggleCollapsed,
  onOpenUrlDialog,
  sensors,
  handleDragEnd
) => {
  const onRemoveLocal = (itemId) => onRemove(section.id, itemId);

  const formMap = {
    education: EducationForm,
    experience: ExperienceForm,
    skills: SkillsForm,
    projects: ProjectsForm,
    // support both singular and plural section ids
    publication: PublicationForm,
    publications: PublicationForm,
    courses: CoursesForm,
  };

  const FormComponent = formMap[section.id] || GenericForm;

  // Wrap items in DnD context per-section so useSortable in SortableItem works correctly
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => handleDragEnd && handleDragEnd(section.id, event)}
    >
      <SortableContext
        items={section.items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {section.items.map((item) => (
          <SortableItem
            key={item.id}
            item={item}
            section={section}
            onToggleCollapsed={onToggleCollapsed}
            onRemove={onRemoveLocal}
          >
            <FormComponent
              item={item}
              sectionName={section.name}
              sectionId={section.id}
              onUpdate={onUpdate}
              onRemove={() => onRemoveLocal(item.id)}
              onToggleCollapsed={onToggleCollapsed}
              onOpenUrlDialog={onOpenUrlDialog}
            />
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};

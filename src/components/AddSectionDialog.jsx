import React from "react";
import { Dialog, DialogTitle, DialogContent, Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AddSectionDialog = ({ open, onClose, availableSections, sections, addSection }) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ m: 0, p: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="h5" fontWeight={700} color="text.primary">Add content</Typography>
      <IconButton aria-label="close" onClick={onClose} sx={{ color: "text.secondary" }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ p: 3 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 2 }}>
        {availableSections.map((section) => {
          const Icon = section.icon;
          const isAdded = sections.find((s) => s.id === section.id && s.visible);
          return (
            <Card
              key={section.id}
              sx={{
                cursor: isAdded ? "not-allowed" : "pointer",
                opacity: isAdded ? 0.5 : 1,
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: isAdded ? 1 : 4,
                  borderColor: isAdded ? "divider" : "primary.main",
                },
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={() => !isAdded && addSection(section.id)}
            >
              <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", gap: 2, flexGrow: 1 }}>
                  <Icon style={{ color: "#6366f1", fontSize: 24, marginTop: 2, flexShrink: 0 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
                      {section.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {section.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </DialogContent>
  </Dialog>
);

export default AddSectionDialog;

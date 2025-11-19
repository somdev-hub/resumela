import { Box, Grid, TextField, Button, Paper, Stack, Typography } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import FormSection from "../FormSection";
import SignatureDialog from "./SignatureDialog";
import { useRef, useState } from "react";


const SignatureSection = ({
  formData,
  setFormData,
  handleInputChange,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handler for dialog close and update
  const handleDialogClose = (result) => {
    setDialogOpen(false);
    if (result && result.name) {
      setFormData((prev) => ({
        ...prev,
        signatureName: result.name,
        signatureFont: result.selectedFont,
        signatureImage: null, // You may want to generate an image from text+font, or just store text/font
      }));
    }
  };

  return (
    <FormSection title="Signature">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            width: 200,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
          }}
        >
          {formData.signatureName ? (
            <Typography
              variant="h5"
              style={{
                fontFamily: formData.signatureFont || "inherit",
                border: "none",
                padding: "0",
                maxHeight: 60,
                maxWidth: "100%",
                objectFit: "contain",
              }}
            >
              {formData.signatureName}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              No signature added
            </Typography>
          )}
        </Paper>
        <Stack spacing={1}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                signatureImage: null,
                signatureName: "",
                signatureFont: "",
                signaturePlace: "",
                signatureDate: "",
              }));
            }}
          >
            Delete
          </Button>
        </Stack>
      </Box>
      <SignatureDialog
        open={dialogOpen}
        onClose={handleDialogClose}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Place"
            name="signaturePlace"
            value={formData.signaturePlace}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date"
            name="signatureDate"
            type="date"
            value={formData.signatureDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};

export default SignatureSection;

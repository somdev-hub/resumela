import { Box, Grid, TextField, Button, Paper, Stack, Typography } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import FormSection from "../FormSection";
import { useRef } from "react";

const SignatureSection = ({
  formData,
  setFormData,
  handleInputChange,
}) => {
  const signatureInputRef = useRef(null);

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
          {formData.signatureImage ? (
            <img
              src={formData.signatureImage}
              alt="signature"
              style={{
                maxHeight: 60,
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Typography variant="body2" color="text.disabled">
              No signature uploaded
            </Typography>
          )}
        </Paper>
        <Stack spacing={1}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => signatureInputRef.current?.click()}
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
                signaturePlace: "",
                signatureDate: "",
              }));
              if (signatureInputRef.current) signatureInputRef.current.value = null;
            }}
          >
            Delete
          </Button>
        </Stack>
        <input
          ref={signatureInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
              setFormData((prev) => ({ ...prev, signatureImage: e.target.result }));
            };
            reader.readAsDataURL(file);
          }}
          style={{ display: "none" }}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Full name"
            name="signatureName"
            value={formData.signatureName}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Place"
            name="signaturePlace"
            value={formData.signaturePlace}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Date"
            name="signatureDate"
            value={formData.signatureDate}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};

export default SignatureSection;

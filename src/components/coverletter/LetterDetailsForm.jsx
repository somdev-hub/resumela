import { Grid, TextField } from "@mui/material";
import FormSection from "../FormSection";

const LetterDetailsForm = ({ formData, handleInputChange }) => {
  return (
    <FormSection title="Letter details">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Recipient Name"
            name="recipientName"
            value={formData.recipientName}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Company Location"
            name="companyLocation"
            value={formData.companyLocation}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};

export default LetterDetailsForm;

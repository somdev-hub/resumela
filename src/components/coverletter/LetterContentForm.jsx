import { Grid, TextField, Typography } from "@mui/material";
import FormSection from "../FormSection";
import RichTextEditor from "../RichTextEditor";

const LetterContentForm = ({ formData, setFormData }) => {
  return (
    <>
      <FormSection title="Letter content">
        <RichTextEditor
          value={formData.letterContent}
          onChange={(html) =>
            setFormData((prev) => ({ ...prev, letterContent: html }))
          }
          placeholder="Write your cover letter here..."
          minHeight={200}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Use the toolbar to format text. The preview and PDFs will render
          paragraph breaks and formatting.
        </Typography>
      </FormSection>
    </>
  );
};

export default LetterContentForm;

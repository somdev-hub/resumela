import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const FormSection = ({ title, subtitle, children, noDivider = false }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {!noDivider && <Divider sx={{ mb: 3 }} />}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.primary" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {children}
    </Box>
  );
};

export default FormSection;

import React from 'react';
import { Paper, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const SectionCard = ({ title, onRemove, children }) => {
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 2, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          {title}
        </Typography>
        {onRemove && (
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{ color: 'error.main' }}
            aria-label="Remove"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {children}
    </Paper>
  );
};

export default SectionCard;

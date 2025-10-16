import React, { useRef, useEffect } from 'react';
import { Box, IconButton, Paper, Divider } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from '@mui/icons-material';

const RichTextEditor = ({ value, onChange, placeholder = 'Start typing...', minHeight = 120 }) => {
  const editorRef = useRef(null);
  const [toolbarState, setToolbarState] = React.useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const handler = () => refreshToolbarState();
    el.addEventListener('mouseup', handler);
    el.addEventListener('keyup', handler);
    el.addEventListener('focus', handler);

    return () => {
      el.removeEventListener('mouseup', handler);
      el.removeEventListener('keyup', handler);
      el.removeEventListener('focus', handler);
    };
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const active = document.activeElement === el;
    if (!active && el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const refreshToolbarState = () => {
    setToolbarState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  };

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    refreshToolbarState();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCmd('createLink', url);
  };

  // eslint-disable-next-line no-unused-vars
  const ToolbarButton = ({ command, icon: IconComponent, title, value = null, active }) => {
    const handleClick = () => {
      if (command === 'createLink') {
        insertLink();
      } else {
        execCmd(command, value);
      }
    };

    return (
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: active ? 'primary.main' : 'text.secondary',
          bgcolor: active ? 'primary.50' : 'transparent',
          '&:hover': { bgcolor: active ? 'primary.100' : 'action.hover' },
        }}
        title={title}
      >
        <IconComponent fontSize="small" />
      </IconButton>
    );
  };

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1, bgcolor: 'grey.50', flexWrap: 'wrap' }}>
        <ToolbarButton command="bold" icon={FormatBold} title="Bold" active={toolbarState.bold} />
        <ToolbarButton command="italic" icon={FormatItalic} title="Italic" active={toolbarState.italic} />
        <ToolbarButton command="underline" icon={FormatUnderlined} title="Underline" active={toolbarState.underline} />
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        <ToolbarButton command="insertUnorderedList" icon={FormatListBulleted} title="Bullet List" active={toolbarState.insertUnorderedList} />
        <ToolbarButton command="insertOrderedList" icon={FormatListNumbered} title="Numbered List" active={toolbarState.insertOrderedList} />
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        <ToolbarButton command="createLink" icon={LinkIcon} title="Insert Link" />
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        <ToolbarButton command="justifyLeft" icon={FormatAlignLeft} title="Align Left" active={toolbarState.justifyLeft} />
        <ToolbarButton command="justifyCenter" icon={FormatAlignCenter} title="Align Center" active={toolbarState.justifyCenter} />
        <ToolbarButton command="justifyRight" icon={FormatAlignRight} title="Align Right" active={toolbarState.justifyRight} />
      </Box>
      
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current.innerHTML)}
        sx={{
          minHeight,
          p: 2,
          outline: 'none',
          '&:focus': {
            bgcolor: 'action.hover',
          },
          '&:empty:before': {
            content: `"${placeholder}"`,
            color: 'text.disabled',
          },
        }}
      />
    </Paper>
  );
};

export default RichTextEditor;

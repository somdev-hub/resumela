# Save as Template Implementation Guide

## Overview
The "Save as Template" feature has been added to the Resume page navbar. This guide explains what needs to be implemented on the backend to complete the feature.

## Frontend Implementation Status: ✅ COMPLETE

### Changes Made:

#### 1. **ResumeNav Component** (`src/components/ResumeNav.jsx`)
- Added "Save as Template" button in both desktop and mobile views
- Button is styled with amber color and save icon (MdSave)
- Accepts `onSaveTemplate` prop from parent component
- Button triggers `handleSaveAsTemplate()` function

#### 2. **Resume Component** (`src/pages/Resume.jsx`)
- Added `handleSaveAsTemplate()` async function that:
  - Collects current resume data in template format
  - Creates JSON payload with required structure: `{ content: {}, layout: {} }`
  - Sends POST request to backend endpoint
  - Shows success/error snackbar notification
- Added `personalFields` constant for form field definitions
- Passes `onSaveTemplate={handleSaveAsTemplate}` to ResumeNav component

## Backend Implementation Required: 🔧 NEEDED

### Endpoint Specifications

**Endpoint:** `POST /save-template`

**Request Body:**
```json
{
  "templateName": "template_1735123456789.json",
  "templateData": {
    "content": {
      "formData": {
        "fullName": "",
        "title": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "github": "",
        "linkedinUrl": "",
        "githubUrl": "",
        "profile": "",
        "photoUrl": null
      },
      "sections": [
        {
          "id": "education",
          "name": "Education",
          "visible": true,
          "items": [
            {
              "id": 1761506326267,
              "collapsed": true,
              "data": {
                "title": "",
                "subtitle": "",
                "date": "",
                "startDate": "",
                "endDate": "",
                "location": "",
                "description": ""
              }
            }
          ]
        }
      ]
    },
    "layout": {
      "layoutConfig": {
        "columns": "two",
        "headerPosition": "top",
        "leftColumnWidth": 50,
        "rightColumnWidth": 50
      },
      "spacingConfig": {
        "fontSize": 9,
        "lineHeight": 1.25,
        "marginLR": 10,
        "marginTB": 10,
        "entrySpacing": 0
      },
      "personalConfig": {
        "align": "center",
        "arrangement": "single",
        "contactStyle": "icon"
      },
      "colorConfig": {
        "mode": "basic",
        "accentMode": "accent",
        "selectedColor": null,
        "selectedColorName": "None",
        "customColor": "#6366f1",
        "multiPreset": "classic",
        "multiTextColor": "#1f2937",
        "multiBackgroundColor": "#ffffff",
        "multiAccentColor": "#2c3e50",
        "multiHeaderTextColor": "#ffffff",
        "multiHeaderBackgroundColor": "#2c3e50",
        "multiHeaderAccentColor": "#ffffff",
        "selectedImage": null,
        "selectedImageId": null,
        "imageOpacity": 0.3
      },
      "selectedFont": {
        "family": "PT Serif",
        "category": "serif",
        "css": "PT+Serif:wght@400;700"
      },
      "sectionOrder": ["education", "experience", "skills"],
      "entryLayoutConfig": {
        "layout": 4,
        "size": "S",
        "subtitleStyle": "Normal",
        "subtitlePlacement": "Next Line",
        "indentBody": false,
        "listStyle": "Bullet",
        "entryOrder": [],
        "conDateLocDisplay": "inline"
      }
    }
  }
}
```

**Response (Success):**
```json
{
  "status": 200,
  "message": "Template saved successfully",
  "templateName": "template_1735123456789.json"
}
```

**Response (Error):**
```json
{
  "status": 400,
  "message": "Error description"
}
```

### Backend Implementation Steps

#### 1. **File System Setup**
- Ensure the server has write permissions to the directory:
  `src/components/marketplace/templates/`
- Create the directory if it doesn't exist

#### 2. **Express.js Implementation Example**
```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

app.post('/save-template', async (req, res) => {
  try {
    const { templateName, templateData } = req.body;

    // Validate input
    if (!templateName || !templateData) {
      return res.status(400).json({
        status: 400,
        message: 'Template name and data are required'
      });
    }

    // Validate template structure
    if (!templateData.content || !templateData.layout) {
      return res.status(400).json({
        status: 400,
        message: 'Template must have content and layout keys'
      });
    }

    // Define the target path
    const templatesDir = path.join(
      __dirname,
      '../',
      'resumela/src/components/marketplace/templates'
    );

    // Ensure directory exists
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Create the file path
    const filePath = path.join(templatesDir, templateName);

    // Write the template file
    fs.writeFileSync(
      filePath,
      JSON.stringify(templateData, null, 2),
      'utf8'
    );

    // Return success response
    res.status(200).json({
      status: 200,
      message: 'Template saved successfully',
      templateName: templateName
    });

  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({
      status: 500,
      message: `Failed to save template: ${error.message}`
    });
  }
});

module.exports = app;
```

#### 3. **Alternative: Database Storage**
If you prefer to store templates in a database instead of the file system:

```javascript
// Example MongoDB implementation
app.post('/save-template', async (req, res) => {
  try {
    const { templateName, templateData } = req.body;

    const template = new Template({
      name: templateName,
      content: templateData.content,
      layout: templateData.layout,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await template.save();

    res.status(200).json({
      status: 200,
      message: 'Template saved successfully',
      templateName: templateName,
      templateId: template._id
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: `Failed to save template: ${error.message}`
    });
  }
});
```

## Testing Instructions

### 1. **Test Save as Template Button**
- Navigate to `/resume/[docId]`
- Click "Save as Template" button in navbar
- Verify the button appears on both desktop and mobile views
- Check browser console for API call

### 2. **Test Backend Endpoint**
```bash
curl -X POST http://localhost:5000/save-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "test_template.json",
    "templateData": {
      "content": { "formData": {}, "sections": [] },
      "layout": {}
    }
  }'
```

### 3. **Verify Template File**
- Check if the JSON file is created in `src/components/marketplace/templates/`
- Verify file structure matches the template schema
- Load template in marketplace to ensure it displays correctly

## Key Considerations

1. **File Naming**: Templates are named with timestamp (`template_${Date.now()}.json`)
2. **Data Structure**: Required keys are `content` and `layout`
3. **Error Handling**: Failures show user-friendly snackbar messages
4. **Security**: Consider implementing:
   - File size limits
   - Rate limiting
   - User authentication/authorization
   - Input validation

## Integration with Marketplace

Once templates are saved:
1. They will appear in the `Marketplace.jsx` component
2. MarketplaceCard will display them with preview
3. Users can use saved templates to create new resumes

## Notes

- The frontend expects the endpoint at `https://resumela-server.onrender.com/save-template`
- Update the URL in `handleSaveAsTemplate()` if your backend is hosted differently
- Ensure CORS is properly configured if frontend and backend are on different domains

/**
 * Export cover letter to PDF by sending HTML to backend
 * Backend uses Puppeteer to generate real PDF with selectable text
 * @param {string} elementId - The ID of the cover letter preview element
 * @param {string} fileName - Name for the exported PDF file
 * @param {Object} options - Additional configuration options
 * @returns {Promise<void>}
 */
export const exportCoverLetterToPDF = async (
  elementId,
  fileName = 'cover_letter',
  options = {}
) => {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    if (options.onStart) {
      options.onStart();
    }

    // Get all styles from the page
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          if (sheet.href) {
            return `@import url('${sheet.href}');`;
          }
          return '';
        }
      })
      .join('\n');

    // Create complete HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            ${styles}
            
            body {
              margin: 0;
              padding: 0;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `;

    // Send to backend API
    const response = await fetch('https://resumela-server.onrender.com/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        fileName: fileName,
      }),
    });

    if (!response.ok) {
      throw new Error('PDF generation failed');
    }

    // Download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    if (options.onSuccess) {
      options.onSuccess();
    }

  } catch (error) {
    console.error('Error exporting cover letter to PDF:', error);
    
    if (options.onError) {
      options.onError(error);
    }
    
    throw error;
  }
};

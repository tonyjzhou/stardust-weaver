function updateTextDisplay(newText, params) {
  // Validate text length (max 10 characters for performance)
  if (newText.length > 10) {
    return false;
  }
  
  // Update the text parameter
  params.textToRender = newText.toUpperCase(); // Convert to uppercase for consistency
  return true;
}

function sanitizeText(text) {
  // Remove invalid characters and limit length
  return text.replace(/[^A-Za-z0-9\s]/g, '').substring(0, 10).toUpperCase();
}

module.exports = { updateTextDisplay, sanitizeText }; 
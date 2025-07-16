const { updateTextDisplay } = require('./textInput');

describe('Text Input Functionality', () => {
  it('updates display text when user enters new text', () => {
    const mockParams = { textToRender: 'OLD' };
    updateTextDisplay('HELLO', mockParams);
    expect(mockParams.textToRender).toBe('HELLO');
  });
  
  it('validates text input length', () => {
    const mockParams = { textToRender: 'TEST' };
    const result = updateTextDisplay('VERY_LONG_TEXT_THAT_EXCEEDS_LIMIT', mockParams);
    expect(result).toBe(false);
    expect(mockParams.textToRender).toBe('TEST'); // unchanged
  });
}); 
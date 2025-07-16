const { MouseDrawing } = require('./interaction');

describe('Mouse Drawing Interaction', () => {
  it('captures mouse path for particle following', () => {
    const drawing = new MouseDrawing();
    drawing.addPoint(0, 0);
    drawing.addPoint(1, 1);
    expect(drawing.getPath().length).toBe(2);
    expect(drawing.getPath()[0]).toEqual({ x: 0, y: 0 });
  });
}); 
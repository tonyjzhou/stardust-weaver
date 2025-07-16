class MouseDrawing {
  constructor() {
    this.path = [];
  }
  
  addPoint(x, y) {
    this.path.push({ x, y });
  }
  
  getPath() {
    return this.path;
  }
  
  clearPath() {
    this.path = [];
  }
  
  getSmoothedPath(smoothingFactor = 0.1) {
    if (this.path.length < 3) return this.path;
    
    const smoothed = [this.path[0]];
    for (let i = 1; i < this.path.length - 1; i++) {
      const prev = this.path[i - 1];
      const curr = this.path[i];
      const next = this.path[i + 1];
      
      smoothed.push({
        x: curr.x + (prev.x + next.x - 2 * curr.x) * smoothingFactor,
        y: curr.y + (prev.y + next.y - 2 * curr.y) * smoothingFactor
      });
    }
    smoothed.push(this.path[this.path.length - 1]);
    return smoothed;
  }
}

module.exports = { MouseDrawing }; 
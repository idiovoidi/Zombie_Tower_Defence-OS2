// Mock for pixi.js to avoid issues with ES modules in tests
const mockContainer = jest.fn().mockImplementation(() => {
  const children = [];
  return {
    children,
    addChild: jest.fn(child => children.push(child)),
    removeChild: jest.fn(child => {
      const index = children.indexOf(child);
      if (index > -1) children.splice(index, 1);
    }),
    destroy: jest.fn(),
    position: { set: jest.fn(), x: 0, y: 0 },
    anchor: { set: jest.fn() },
    on: jest.fn(),
    clear: jest.fn(),
    circle: jest.fn().mockReturnThis(),
    fill: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    roundRect: jest.fn().mockReturnThis(),
    visible: true,
    alpha: 1,
    rotation: 0,
  };
});

const mockGraphics = jest.fn().mockImplementation(() => {
  const children = [];
  return {
    children,
    addChild: jest.fn(child => children.push(child)),
    removeChild: jest.fn(child => {
      const index = children.indexOf(child);
      if (index > -1) children.splice(index, 1);
    }),
    destroy: jest.fn(),
    clear: jest.fn(),
    circle: jest.fn().mockReturnThis(),
    ellipse: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    fill: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    roundRect: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    position: { set: jest.fn(), x: 0, y: 0 },
    alpha: 1,
    rotation: 0,
    tint: 0xffffff,
  };
});

const mockText = jest.fn().mockImplementation(options => {
  return {
    text: options.text,
    style: options.style,
    position: { set: jest.fn() },
    anchor: { set: jest.fn() },
  };
});

module.exports = {
  Container: mockContainer,
  Graphics: mockGraphics,
  Text: mockText,
};

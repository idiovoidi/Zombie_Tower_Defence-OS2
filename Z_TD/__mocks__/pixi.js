// Mock for pixi.js to avoid issues with ES modules in tests
const mockContainer = jest.fn().mockImplementation(() => {
  return {
    addChild: jest.fn(),
    removeChild: jest.fn(),
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
  };
});

const mockGraphics = jest.fn().mockImplementation(() => {
  return {
    clear: jest.fn(),
    circle: jest.fn().mockReturnThis(),
    fill: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    roundRect: jest.fn().mockReturnThis(),
    position: { set: jest.fn() },
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

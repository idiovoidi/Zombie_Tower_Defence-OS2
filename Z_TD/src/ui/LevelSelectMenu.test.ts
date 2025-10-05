import { LevelSelectMenu } from './LevelSelectMenu';
import { LevelData } from '../managers/LevelManager';

// Test LevelSelectMenu creation
test('LevelSelectMenu creates with required elements', () => {
  const menu = new LevelSelectMenu();

  // Should have title text
  expect(menu.children.length).toBeGreaterThan(0);

  // Should have back button
  // Implementation details would depend on how children are tracked
});

// Test level button generation
test('LevelSelectMenu updates with level buttons', () => {
  const menu = new LevelSelectMenu();
  const mockLevels: LevelData[] = [
    {
      id: 'test1',
      name: 'Test Level 1',
      description: 'A test level',
      map: 'default',
      difficulty: 'Easy',
      startingMoney: 500,
      startingLives: 20,
      resourceModifiers: { wood: 1, metal: 1, energy: 1 },
    },
  ];

  menu.updateLevels(mockLevels);
  // Verify buttons are created (implementation dependent)
  // This would require more detailed inspection of the component's children
});

// Test callback registration
test('LevelSelectMenu allows callback registration', () => {
  const menu = new LevelSelectMenu();

  // Should be able to set callbacks without error
  expect(() => {
    menu.setLevelSelectCallback(() => {});
    menu.setBackCallback(() => {});
  }).not.toThrow();
});

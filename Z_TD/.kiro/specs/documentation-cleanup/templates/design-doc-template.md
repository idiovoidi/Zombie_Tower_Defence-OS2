# [Feature/System Name]

Brief one-paragraph overview of what this feature/system does and why it exists.

## Overview

Detailed description of the feature/system:
- What problem does it solve?
- What are the key capabilities?
- How does it fit into the larger system?

## Architecture

High-level architecture and design decisions.

```
[ASCII diagram or Mermaid diagram showing system structure]
```

### Components

List and describe the main components:

#### Component 1
- **Purpose**: What it does
- **Location**: File path
- **Responsibilities**: Key functions

#### Component 2
- **Purpose**: What it does
- **Location**: File path
- **Responsibilities**: Key functions

### Data Flow

Describe how data moves through the system:
1. Step one
2. Step two
3. Step three

## Implementation Details

### Core Algorithms

Describe key algorithms or logic:

```typescript
// Example implementation
function coreAlgorithm() {
  // Detailed example with comments
}
```

### Data Models

Define interfaces, types, and data structures:

```typescript
interface DataModel {
  property: type;
  // Document each property
}
```

### Configuration

Any configuration options or constants:

```typescript
const CONFIG = {
  option: value,
  // Explain each option
};
```

## Integration Points

How this system integrates with others:

### Dependencies
- System A: Why and how it's used
- System B: Why and how it's used

### Consumers
- System C: How it uses this system
- System D: How it uses this system

## Usage Examples

### Basic Usage

```typescript
// Simple example
const example = new Feature();
example.doSomething();
```

### Advanced Usage

```typescript
// More complex example
const advanced = new Feature({
  options: true,
});
advanced.doComplexThing();
```

## Error Handling

How errors are handled and what errors can occur:

### Common Errors
- **ErrorType1**: When it occurs and how to handle
- **ErrorType2**: When it occurs and how to handle

### Error Recovery
Describe recovery strategies and fallback behavior.

## Performance Considerations

- Memory usage characteristics
- Performance bottlenecks
- Optimization strategies
- Benchmarks or metrics

## Testing Strategy

### Unit Tests
What should be unit tested and how:
- Test case 1
- Test case 2

### Integration Tests
What integration scenarios to test:
- Scenario 1
- Scenario 2

### Manual Testing
How to manually verify functionality:
1. Step one
2. Step two
3. Expected result

## Known Issues

List any known limitations or issues:
- Issue 1: Description and workaround
- Issue 2: Description and workaround

## Future Enhancements

Potential improvements or planned features:
- Enhancement 1: Description
- Enhancement 2: Description

## References

- [Related Design Doc](./RELATED_DOC.md)
- [External Resource](https://example.com)
- [Steering Rule](../../.kiro/steering/features/[rule].md)

## Change History

| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial creation | Name |
| YYYY-MM-DD | Major update | Name |

---

**Guidelines for this template:**
- No size limit - be as detailed as needed
- Include diagrams where helpful
- Provide working code examples
- Document design decisions and rationale
- Keep current with code changes
- Link to related documentation

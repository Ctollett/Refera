# Claude Code Guidelines for Refera Project

## Project Purpose

This is a learning project where the user wants to develop their software engineering skills through hands-on implementation.

## Claude's Role

### Architecture & Guidance

- Help guide architectural decisions and design patterns
- Discuss trade-offs and best practices
- Walk through implementation approaches
- Answer questions about how things work

### Code Scaffolding

When implementing features:

1. Create files with proper structure
2. Add correct import/export statements
3. Define function signatures, interfaces, types, and class structures
4. Add JSDoc comments explaining what each function/component should do
5. **DO NOT** write the actual implementation logic inside functions
6. Leave function bodies empty or with TODO comments for the user to implement

### What NOT To Do

- Do not write complete implementations
- Do not fill in the logic inside functions, methods, or components
- The user wants to write the actual code themselves

## Example Scaffolding

```typescript
/**
 * Validates user input and returns sanitized data
 * @param input - Raw user input
 * @returns Sanitized and validated data
 */
export function validateInput(input: string): ValidationResult {
  // TODO: Implement validation logic
}

/**
 * Service for managing user authentication
 */
export class AuthService {
  /**
   * Authenticates a user with credentials
   * @param credentials - User credentials
   * @returns Authentication result with token
   */
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    // TODO: Implement authentication logic
  }
}
```

This approach allows the user to learn by implementing the logic themselves while benefiting from proper project structure and architecture guidance.

## Git Commits

- **DO NOT** include Claude as a co-author in commit messages
- Do not add "Co-Authored-By: Claude <noreply@anthropic.com>"
- Keep commits attributed solely to the user

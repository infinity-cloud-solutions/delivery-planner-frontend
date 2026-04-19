# GitHub Copilot Workspace Instructions

This file provides workspace-level instructions for GitHub Copilot to improve code suggestions and chat responses for this project.

---

## 🏗️ Project Context

**Project**: Delivery Planner Frontend  
**Stack**: React, JavaScript, Chakra UI  
**Purpose**: Admin and driver portal for delivery route planning and management

---

## 📋 General Coding Guidelines

### Code Style
- Use functional React components with hooks
- Follow ES6+ JavaScript conventions
- Use descriptive variable and function names
- Keep functions small and focused (single responsibility)
- Add JSDoc comments for complex functions

### React Patterns
- Use React hooks (useState, useEffect, useContext, etc.)
- Implement proper error boundaries
- Use React.memo for performance optimization when needed
- Follow Chakra UI component patterns
- Keep component files under 300 lines when possible

### File Organization
- Components in `src/components/`
- Views in `src/views/`
- Utilities in `src/utils/`
- Contexts in `src/contexts/`
- Routes in root `src/` files (routes.js, authRoutes.js, driverRoutes.js)

---

## 🧪 Testing Guidelines

### When Asked to Create or Improve Unit Tests

Follow the comprehensive testing guidelines in:
- **Agent**: `.github/copilot/unit-test-coverage-agent.md` - For autonomous test generation
- **Skill**: `.github/copilot/unit-test-coverage-skill.md` - For step-by-step workflows

### Testing Standards
- Achieve 100% code coverage for new code
- Follow AAA pattern (Arrange-Act-Assert)
- Use descriptive test names: `should [expected behavior] when [condition]`
- Mock external dependencies (APIs, localStorage, etc.)
- Test happy paths, edge cases, and error cases
- Ensure tests are deterministic (no flaky tests)

### Test File Naming
- Place tests in `__tests__/` directory or co-located with source
- Name test files: `[ComponentName].test.js` or `[fileName].test.js`
- Use `describe` blocks to group related tests
- Use `beforeEach`/`afterEach` for setup/teardown

### Testing Framework
- **Framework**: Jest (configured in project)
- **React Testing**: React Testing Library
- **Coverage Tool**: Jest built-in coverage
- **Run Tests**: `npm test`
- **Coverage Report**: `npm test -- --coverage`

---

## 🔒 Security Guidelines

### Authentication & Authorization
- Never hardcode credentials or API keys
- Use environment variables for sensitive data
- Validate user permissions before rendering admin features
- Implement proper session management

### Data Handling
- Sanitize user inputs
- Validate data before sending to backend
- Use HTTPS for all API calls
- Don't log sensitive information

---

## 🎨 UI/UX Guidelines

### Chakra UI Usage
- Use Chakra UI components consistently
- Follow the theme defined in `src/theme/`
- Use responsive design patterns (mobile-first)
- Implement proper loading states
- Show user-friendly error messages

### Accessibility
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers when possible

---

## 📡 API Integration

### Backend Communication
- Use environment variables for API endpoints (REACT_APP_*)
- Implement proper error handling for API calls
- Show loading states during async operations
- Handle network errors gracefully
- Use try/catch blocks for async/await

### Data Flow
- Fetch data in useEffect hooks
- Update state after successful API calls
- Invalidate/refresh data when needed
- Handle stale data appropriately

---

## 🚀 Performance Guidelines

### Optimization
- Use React.memo for expensive components
- Implement code splitting for large routes
- Lazy load images and heavy components
- Debounce search inputs and frequent updates
- Minimize re-renders with proper dependency arrays

### Bundle Size
- Avoid importing entire libraries (use tree-shaking)
- Remove unused dependencies
- Optimize images before adding to project

---

## 📝 Documentation Guidelines

### Code Comments
- Add JSDoc comments for exported functions
- Explain "why" not "what" in comments
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes

### Component Documentation
```javascript
/**
 * Card component for displaying delivery information
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {ReactNode} props.children - Card content
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element}
 */
```

---

## 🐛 Error Handling

### Frontend Error Handling
- Use try/catch for async operations
- Implement error boundaries for React components
- Show user-friendly error messages
- Log errors for debugging (but not sensitive data)
- Provide fallback UI for errors

### Error Messages
- Be specific about what went wrong
- Suggest actions the user can take
- Avoid technical jargon in user-facing messages
- Include error codes for support reference

---

## 🔄 State Management

### Context Usage
- Use React Context for global state (see `src/contexts/`)
- Keep context focused (separate concerns)
- Provide clear context provider hierarchy
- Document context shape and usage

### Local State
- Use useState for component-local state
- Use useReducer for complex state logic
- Lift state up when needed by multiple components
- Avoid prop drilling (use context instead)

---

## 🛣️ Routing

### Route Configuration
- Admin routes in `routes.js`
- Auth routes in `authRoutes.js`
- Driver routes in `driverRoutes.js`
- Use React Router for navigation
- Implement route guards for protected routes

---

## 🌍 Environment Variables

### Required Variables
- `REACT_APP_DRIVERS_MAP` - Maps users to driver numbers
- `REACT_APP_UPDATE_SEQUENCING_ORDERS_BASE_URL` - API endpoint for order updates
- Other API endpoints as needed

### Usage
```javascript
const apiUrl = process.env.REACT_APP_API_BASE_URL;
```

---

## 📦 Dependencies

### Key Dependencies
- **React**: UI library
- **Chakra UI**: Component library
- **React Router**: Routing
- **Axios** (if used): HTTP client

### Adding Dependencies
- Check if functionality exists in current dependencies first
- Prefer well-maintained, popular libraries
- Consider bundle size impact
- Update package.json and package-lock.json

---

## 🔧 Build & Deployment

### Build Commands
- **Development**: `npm start`
- **Production Build**: `npm run build`
- **Test**: `npm test`
- **Coverage**: `npm test -- --coverage`

### Configuration
- Build configuration in `config-overrides.js`
- Environment-specific configs in `.env` files

---

## 🎯 Custom Instructions Usage

### For Testing Tasks
When asked to create or improve tests, GitHub Copilot should:
1. Reference `.github/copilot/unit-test-coverage-agent.md` for autonomous test generation
2. Follow `.github/copilot/unit-test-coverage-skill.md` for step-by-step workflows
3. Achieve 100% coverage (lines, branches, functions)
4. Never modify production code
5. Follow AAA pattern and best practices

### Example Prompts
```
"Achieve 100% unit test coverage for src/utils/Utility.js"
"Follow the unit test coverage workflow to test authRoutes.js"
"Write comprehensive tests for components/Card.jsx"
```

---

## 🚨 Important Reminders

### DO
- ✅ Write clean, readable, maintainable code
- ✅ Follow existing patterns and conventions
- ✅ Test your code thoroughly
- ✅ Handle errors gracefully
- ✅ Document complex logic
- ✅ Consider accessibility
- ✅ Optimize for performance

### DON'T
- ❌ Hardcode sensitive data
- ❌ Modify production code when writing tests
- ❌ Ignore error handling
- ❌ Create flaky tests
- ❌ Over-engineer simple solutions
- ❌ Commit commented-out code
- ❌ Leave console.logs in production code

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Chakra UI Documentation](https://chakra-ui.com/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [JavaScript Best Practices](https://github.com/ryanmcdermott/clean-code-javascript)

---

**Note**: These instructions are automatically applied to all GitHub Copilot interactions in this workspace. For specific testing workflows, reference the custom instructions in `.github/copilot/`.

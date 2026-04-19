---
name: unit-test-generation
description: Describe what this skill does and when to use it. Include keywords that help agents identify relevant tasks.
---

## 🎯 Overview

This skill provides a comprehensive, step-by-step workflow for GitHub Copilot to create unit tests that achieve 100% code coverage for any given module. The workflow adapts to the detected technology stack and follows industry best practices.

---

## 📋 Prerequisites

Before starting this workflow:

- ✅ Basic understanding of unit testing concepts
- ✅ Familiarity with the target programming language
- ✅ Access to the codebase and ability to run tests
- ✅ (Optional) Existing test framework configuration

---

## 📥 Input Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| Target Module | Yes | File or folder path to test | `src/utils/Utility.js` |
| Stack Context | No | Programming language and framework (auto-detected) | `JavaScript/Jest` |
| Coverage Threshold | No | Target coverage percentage | `100%` (default) |
| Existing Tests | No | Location of current test files | `__tests__/Utility.test.js` |

---

## 📤 Expected Outputs

Upon completion, this workflow delivers:

1. ✅ Complete test suite with 100% coverage
2. ✅ Coverage report (HTML/JSON/LCOV format)
3. ✅ Test execution summary (all tests passing)
4. ✅ Documentation of test approach and edge cases

---

## 🔄 Workflow Steps

### 📍 Phase 1: Discovery & Setup

---

#### **Step 1: Stack & Framework Detection**

**Objective**: Identify the technology stack and testing framework

**Actions**:
1. Examine dependency files:
   - JavaScript/TypeScript: `package.json`
   - Python: `requirements.txt`, `pyproject.toml`
   - Java: `pom.xml`, `build.gradle`
   - Other: Equivalent dependency files

2. Identify primary language and detect test framework:
   - **JavaScript/TypeScript**: Jest, Mocha, Vitest, Jasmine
   - **Python**: pytest, unittest, nose2
   - **Java**: JUnit, TestNG
   - **Other**: Adapt based on detected stack

3. Check for test runner configuration:
   - `jest.config.js`, `vitest.config.ts`
   - `pytest.ini`, `setup.cfg`
   - `junit.xml`

**Validation Checklist**:
- [ ] Framework identified
- [ ] Framework installed in dependencies
- [ ] Version compatibility verified

**Example Copilot Prompt**:
```
"Analyze package.json and identify the testing framework for this project"
```

---

#### **Step 2: Test Environment Setup**

**Objective**: Ensure test infrastructure is ready

**Actions**:

**If test framework exists**:
- Verify configuration is valid
- Check coverage tool is configured
- Verify coverage thresholds are set

**If test framework missing**:
- Install appropriate test framework
- Install coverage tool
- Create configuration file
- Set coverage thresholds to 100%

**Folder Structure**:
- Identify or create test directory:
  - `__tests__/` (Jest convention)
  - `tests/` (Python/general)
  - `test/` (Node convention)
  - Co-located `*.test.js` or `*.spec.js`
- Mirror source structure if applicable

**Validation Checklist**:
- [ ] Test command runs successfully
- [ ] Coverage report can be generated
- [ ] Test directory structure exists

**Example Copilot Prompts**:
```
"Set up Jest with coverage reporting for this project"
"Create a pytest configuration with 100% coverage threshold"
```

---

### 📍 Phase 2: Analysis

---

#### **Step 3: Code Analysis**

**Objective**: Understand the target module's structure and complexity

**Actions**:

1. **Read and parse target module**:
   - Identify all exported functions, classes, methods
   - Map function signatures and parameters
   - Identify dependencies (imports, external modules)

2. **Analyze code paths**:
   - Conditional branches (if/else, switch, ternary)
   - Loops and iterations
   - Error handling (try/catch, error callbacks)
   - Async operations (promises, async/await, callbacks)
   - Edge cases (null/undefined, empty arrays, boundaries)

3. **Document complexity**:
   - Cyclomatic complexity indicators
   - Number of test cases needed per function
   - Dependencies requiring mocking

**Validation Checklist**:
- [ ] Complete inventory of testable units
- [ ] All code paths identified
- [ ] Dependencies documented

**Example Copilot Prompt**:
```
"Analyze src/utils/Utility.js and list all functions, branches, and dependencies that need testing"
```

---

#### **Step 4: Existing Test Assessment**

**Objective**: Understand current coverage state

**Actions**:

1. Search for existing test files
2. If tests exist:
   - Run coverage report
   - Identify covered vs. uncovered lines
   - Analyze coverage gaps
   - Review test quality

3. If no tests exist:
   - Start from 0% baseline
   - Plan comprehensive test suite

**Validation Checklist**:
- [ ] Coverage baseline established
- [ ] Gap analysis complete
- [ ] Existing test quality assessed

**Example Copilot Prompts**:
```
"Run coverage report and identify gaps in src/utils/Utility.js"
"Analyze existing tests for authRoutes.js and list uncovered code paths"
```

---

### 📍 Phase 3: Test Creation

---

#### **Step 5: Test Scaffolding**

**Objective**: Create test file structure and skeletons

**Actions**:

1. **Create test file**:
   - Follow project naming convention
   - Place in appropriate test directory

2. **Import target module and dependencies**:
   ```javascript
   import { functionA, functionB } from '../utils/Utility';
   import { mockDependency } from '../mocks';
   ```

3. **Set up test structure**:
   - Use `describe` blocks to group related tests
   - Create `test`/`it` blocks for each test case
   - Add `beforeEach`/`afterEach` for setup/teardown
   - Structure by function/class, then by scenario

**Example Structure**:
```javascript
describe('Utility Module', () => {
  beforeEach(() => {
    // Setup
  });

  describe('functionA', () => {
    test('should handle valid input', () => {});
    test('should handle edge case: empty input', () => {});
    test('should throw error for invalid input', () => {});
  });
  
  describe('functionB', () => {
    test('should return expected output', () => {});
    test('should handle async operation', () => {});
  });
});
```

**Validation Checklist**:
- [ ] Test file created with proper naming
- [ ] Structure is clear and organized
- [ ] All functions have test blocks

**Example Copilot Prompt**:
```
"Create test file scaffolding for src/utils/Utility.js with describe blocks for each function"
```

---

#### **Step 6: Test Implementation**

**Objective**: Write comprehensive tests following best practices

**Follow AAA Pattern** (Arrange-Act-Assert):

```javascript
test('should calculate total correctly', () => {
  // Arrange: Set up test data
  const items = [{ price: 10 }, { price: 20 }];
  const taxRate = 0.1;
  
  // Act: Execute function
  const result = calculateTotal(items, taxRate);
  
  // Assert: Verify outcome
  expect(result).toBe(33);
});
```

**Test Categories to Cover**:

1. ✅ **Happy Path**: Normal, expected inputs and flow
2. ✅ **Edge Cases**: Boundary values, empty inputs, null/undefined
3. ✅ **Error Cases**: Invalid inputs, exceptions, error handling
4. ✅ **Async Cases**: Promises, async/await, callbacks
5. ✅ **Branch Coverage**: All if/else, switch cases, ternary operators
6. ✅ **Integration Points**: Mocked dependencies, external calls

**Mocking Strategy**:
- Mock external dependencies (APIs, databases, file system)
- Use spies to verify function calls
- Stub complex dependencies
- Avoid over-mocking—use real implementations when simple

**Assertion Best Practices**:
- Use specific matchers (toBe, toEqual, toThrow)
- One logical assertion per test
- Clear, descriptive test names
- Avoid test interdependencies

**Example Test Cases**:

```javascript
// Normal case
test('should format date correctly', () => {
  const date = new Date('2024-01-15');
  expect(formatDate(date)).toBe('01/15/2024');
});

// Edge case
test('should handle null date', () => {
  expect(formatDate(null)).toBe('');
});

// Error case
test('should throw error for invalid date', () => {
  expect(() => formatDate('invalid')).toThrow('Invalid date');
});

// Async case
test('should fetch user data successfully', async () => {
  const mockUser = { id: 1, name: 'John' };
  jest.spyOn(api, 'getUser').mockResolvedValue(mockUser);
  
  const result = await fetchUserData(1);
  
  expect(result).toEqual(mockUser);
  expect(api.getUser).toHaveBeenCalledWith(1);
});

// Branch coverage
test('should apply discount when eligible', () => {
  const user = { isPremium: true };
  expect(calculatePrice(user, 100)).toBe(90);
});

test('should not apply discount when not eligible', () => {
  const user = { isPremium: false };
  expect(calculatePrice(user, 100)).toBe(100);
});
```

**Validation Checklist**:
- [ ] All test cases implemented
- [ ] Tests follow AAA pattern
- [ ] Appropriate mocking in place
- [ ] Clear assertions

**Example Copilot Prompts**:
```
"Write comprehensive unit tests for the calculateTotal function covering normal, edge, and error cases"
"Generate tests for all branches in the processOrder function"
```

---

### 📍 Phase 4: Iteration & Validation

---

#### **Step 7: Run Tests & Analyze Coverage**

**Objective**: Execute tests and measure coverage

**Actions**:

1. **Run test suite with coverage**:
   ```bash
   # JavaScript/Jest
   npm test -- --coverage
   
   # Python/pytest
   pytest --cov=src/utils tests/
   
   # Java/Maven
   mvn test jacoco:report
   ```

2. **Analyze coverage report**:
   - Check line coverage percentage
   - Check branch coverage percentage
   - Check function coverage percentage
   - Identify uncovered lines
   - Review uncovered branches

3. **Identify gaps**:
   - Which lines are not covered?
   - Which branches are not tested?
   - Are there unreachable code paths?
   - Are error handlers tested?

**Validation Checklist**:
- [ ] Coverage report generated
- [ ] Gaps clearly identified
- [ ] Metrics documented

**Example Copilot Prompts**:
```
"Run coverage report and show me which lines in Utility.js are not covered"
"Analyze the coverage gaps and suggest test cases to reach 100%"
```

---

#### **Step 8: Iterate to 100%**

**Objective**: Add or refine tests until full coverage achieved

**Actions**:

1. **For each uncovered line/branch**:
   - Determine what input/scenario triggers that path
   - Add new test case or extend existing test
   - Re-run tests to verify coverage increase

2. **Common coverage gaps**:
   - ❌ Uncovered error handlers → Add tests that trigger errors
   - ❌ Uncovered else branches → Add tests for false conditions
   - ❌ Uncovered default cases → Test switch default/fallback logic
   - ❌ Uncovered async error paths → Test promise rejections
   - ❌ Uncovered edge cases → Test null, undefined, empty values

3. **Refine tests**:
   - Ensure all tests pass consistently
   - Remove redundant tests
   - Improve test clarity
   - Add comments for complex scenarios

4. **Repeat until**:
   - ✅ 100% line coverage
   - ✅ 100% branch coverage
   - ✅ 100% function coverage
   - ✅ All tests passing

**Validation Checklist**:
- [ ] 100% coverage across all metrics
- [ ] All tests pass reliably
- [ ] No flaky tests

**Example Copilot Prompts**:
```
"Add tests to cover the remaining 5% of uncovered lines in Utility.js"
"Write test cases for the error handling paths that are currently uncovered"
```

---

### 📍 Phase 5: Quality Assurance

---

#### **Step 9: Quality Criteria Validation**

**Objective**: Ensure tests meet quality standards

**Quality Checklist**:

- ✅ **No production code modified**: Only test files created/edited
- ✅ **All code paths tested**: Every line, branch, and function covered
- ✅ **Error cases tested**: Exception handling and error paths verified
- ✅ **Tests are readable**: Clear names, good structure, appropriate comments
- ✅ **Tests are maintainable**: No duplication, proper setup/teardown, isolated tests
- ✅ **Tests follow conventions**: Match project style, naming, and organization
- ✅ **Tests are deterministic**: No flaky tests, consistent results
- ✅ **Coverage confirmed**: 100% verified by coverage tool
- ✅ **Performance acceptable**: Tests run in reasonable time

**Actions**:
- Review test code for clarity
- Verify no test interdependencies
- Check for proper cleanup (mocks, timers)
- Ensure tests can run in isolation

**Validation Checklist**:
- [ ] All quality criteria met
- [ ] Tests are production-ready
- [ ] Documentation complete

**Example Copilot Prompt**:
```
"Review the test suite for Utility.js and suggest improvements for readability and maintainability"
```

---

## ✅ Success Metrics

A test coverage task is complete when:

| Metric | Target | Status |
|--------|--------|--------|
| Line Coverage | 100% | ⬜ |
| Branch Coverage | 100% | ⬜ |
| Function Coverage | 100% | ⬜ |
| Test Pass Rate | 100% | ⬜ |
| Production Code Modified | 0 files | ⬜ |
| Test Quality | High | ⬜ |
| Test Performance | <5s for small modules | ⬜ |

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Over-mocking
**Problem**: Mocking everything makes tests fragile  
**Solution**: Only mock external dependencies; use real implementations for internal logic

### Pitfall 2: Testing Implementation Details
**Problem**: Tests break when refactoring  
**Solution**: Test public API and behavior, not internal implementation

### Pitfall 3: Flaky Tests
**Problem**: Tests pass/fail inconsistently  
**Solution**: Avoid timing dependencies, ensure proper async handling, isolate tests

### Pitfall 4: Unclear Test Names
**Problem**: Hard to understand what failed  
**Solution**: Use descriptive names: "should return error when input is null"

### Pitfall 5: Chasing 100% at All Costs
**Problem**: Testing trivial code or unreachable paths  
**Solution**: Focus on meaningful coverage; discuss unreachable code with team

---

## 💬 Example Usage Prompts

Invoke this skill with prompts like:

```
"Follow the unit test coverage workflow to test src/utils/Utility.js"
```

```
"Apply the coverage skill to achieve 100% coverage for authRoutes.js"
```

```
"Use the step-by-step testing workflow for components/Card.jsx"
```

```
"Execute the unit test coverage skill for the entire utils/ folder"
```

---

## 📚 References & Resources

### Testing Frameworks
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [pytest Documentation](https://docs.pytest.org/)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)

### Best Practices
- [Testing Best Practices by Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [AAA Pattern Explained](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)
- [Martin Fowler on Test Coverage](https://martinfowler.com/bliki/TestCoverage.html)
- [Google Testing Blog](https://testing.googleblog.com/)

### Coverage Tools
- [Istanbul/nyc](https://istanbul.js.org/)
- [Coverage.py](https://coverage.readthedocs.io/)
- [JaCoCo](https://www.jacoco.org/jacoco/)

### Mocking Libraries
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [unittest.mock](https://docs.python.org/3/library/unittest.mock.html)
- [Mockito](https://site.mockito.org/)

---

## 🔗 Related Skills & Agents

- `unit-test-coverage-agent.md` - Agent that uses this skill
- Integration Test Coverage Workflow
- E2E Test Automation Workflow
- Mutation Testing Validation
- Test-Driven Development (TDD) Workflow

---

## 📝 Version History

- **1.0.0** (2024): Initial GitHub Copilot skill workflow

---

## 💡 Tips for Using This Skill

1. **Follow Steps Sequentially**: Don't skip phases—each builds on the previous
2. **Ask for Clarification**: If a step is unclear, ask Copilot to explain
3. **Review Generated Code**: Always review and understand generated tests
4. **Iterate**: If coverage isn't 100%, return to Step 7-8
5. **Customize**: Adapt this workflow to your project's specific needs
6. **Document**: Keep notes on complex test scenarios for future reference

---

**Note**: This skill is designed to work with GitHub Copilot Chat. Reference this file when you want Copilot to follow a structured approach to achieving 100% test coverage.

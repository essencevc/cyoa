# CYOA Unit Tests

This directory contains unit tests for the CYOA (Choose Your Own Adventure) application.

## Running the Tests

To run the tests, you'll need to install the development dependencies:

```bash
cd restate
pip install -e ".[dev]"
```

Then, you can run the tests using pytest:

```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run a specific test file
pytest tests/test_db.py

# Run a specific test
pytest tests/test_db.py::test_insert_story
```

## Test Coverage

The tests cover the following components:

1. **Database Client** (`test_db.py`):
   - Testing the singleton pattern
   - Testing database operations (insert_story, mark_story_as_completed, insert_story_nodes)
   - Testing connection retry mechanism

2. **S3 Helper** (`test_s3.py`):
   - Testing S3 operations (get_story_items)
   - Testing error handling

3. **Story Generation** (`test_story.py`):
   - Testing story outline generation
   - Testing story choices generation
   - Testing image generation
   - Testing text-to-speech generation

4. **Main Workflow** (`test_main.py`):
   - Testing the main workflow success path
   - Testing error handling for various failure scenarios
   - Testing timeout handling

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create test files with the `test_` prefix
2. Use descriptive test function names that explain what is being tested
3. Use fixtures to set up common test dependencies
4. Mock external dependencies to isolate the code being tested
5. Test both success and failure scenarios

## Test Structure

Each test file follows a similar structure:

1. Import necessary modules and the code being tested
2. Define fixtures for setting up test dependencies
3. Define test functions that use the fixtures
4. Assert expected outcomes

## Continuous Integration

These tests can be integrated into a CI/CD pipeline to ensure code quality before deployment.
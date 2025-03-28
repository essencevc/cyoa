# CYOA Modal Service Unit Tests

This directory contains unit tests for the CYOA (Choose Your Own Adventure) Modal services.

## Running the Tests

To run the tests, you'll need to install the development dependencies:

```bash
cd modal
pip install -e ".[dev]"
```

Then, you can run the tests using pytest:

```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run a specific test file
pytest tests/test_images.py

# Run a specific test
pytest tests/test_images.py::test_api
```

## Test Coverage

The tests cover the following components:

1. **Image Generation Service** (`test_images.py`):
   - Testing the ComfyUI background process launch
   - Testing the inference method
   - Testing the API endpoint for image generation

2. **Audio Generation Service** (`test_audio.py`):
   - Testing the audio generation endpoint
   - Testing the integration with the text-to-audio pipeline
   - Testing S3 upload and callback functionality

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
2. Define mock classes for the Modal library (since it's not available in the test environment)
3. Define fixtures for setting up test dependencies
4. Define test functions that use the fixtures
5. Assert expected outcomes

## Mocking Modal

Since the Modal library is not available in the test environment, we use mock classes to simulate its behavior. This allows us to test the code without actually deploying it to Modal.

## Continuous Integration

These tests can be integrated into a CI/CD pipeline to ensure code quality before deployment.
import os
import pytest
from dotenv import load_dotenv

# Load environment variables for tests
@pytest.fixture(scope="session", autouse=True)
def load_env():
    """Load environment variables for tests"""
    load_dotenv()
    
    # Set a test API key if not present
    if not os.environ.get("OPENROUTER_API_KEY"):
        os.environ["OPENROUTER_API_KEY"] = "test-api-key-for-pytest"
    
    yield

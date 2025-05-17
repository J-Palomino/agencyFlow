#!/usr/bin/env python3

"""
Simple test script for OpenRouter integration.
"""

import os
from dotenv import load_dotenv
import sys

# Print Python version
print(f"Python version: {sys.version}")

# Load environment variables
print("Loading environment variables...")
load_dotenv("/Users/juan/compadrescocina/agencyFlow/backend/litellm_agent/.env")

# Print environment variables (safely)
api_key = os.getenv("OPENAI_API_KEY", "")
api_base = os.getenv("OPENAI_API_BASE", "")
print(f"OPENAI_API_BASE: {api_base}")
print(f"OPENAI_API_KEY: {api_key[:8]}...{api_key[-4:] if len(api_key) > 12 else ''}")

# Try a simple OpenAI API call
try:
    print("\nTesting OpenAI API directly...")
    from openai import OpenAI
    
    client = OpenAI(
        api_key=api_key,
        base_url=api_base
    )
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hello, how are you?"}]
    )
    
    print("OpenAI API Response:")
    print(response.choices[0].message.content)
    
except Exception as e:
    print(f"OpenAI API Error: {str(e)}")

# Try with LiteLLM
try:
    print("\nTesting with LiteLLM...")
    import litellm
    
    # Print LiteLLM version
    print(f"LiteLLM version: {litellm.__version__}")
    
    # Enable verbose mode
    litellm.set_verbose = True
    
    # Set API key and base URL
    os.environ["OPENAI_API_KEY"] = api_key
    os.environ["OPENAI_API_BASE"] = api_base
    
    # Make a simple completion call
    from litellm import completion
    
    response = completion(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hello, how are you?"}]
    )
    
    print("LiteLLM Response:")
    print(response.choices[0].message.content)
    
except Exception as e:
    print(f"LiteLLM Error: {str(e)}")

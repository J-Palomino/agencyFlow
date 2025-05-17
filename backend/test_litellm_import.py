#!/usr/bin/env python3

"""
Test script to verify litellm imports are working correctly for ADK.
"""

import sys
import os

# Add the parent directory to the path so we can import litellm
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to import the module
import litellm

# Check if agent is accessible as a module
print(f"Has agent attribute: {hasattr(litellm, 'agent')}")

# Check if root_agent is accessible through the agent module
if hasattr(litellm, 'agent'):
    print(f"Has root_agent attribute: {hasattr(litellm.agent, 'root_agent')}")
    if hasattr(litellm.agent, 'root_agent'):
        print(f"root_agent: {litellm.agent.root_agent}")
else:
    print("Cannot check for root_agent because agent module is not accessible")

# Print the module search path
print("\nModule search path:")
for path in sys.path:
    print(f"  {path}")

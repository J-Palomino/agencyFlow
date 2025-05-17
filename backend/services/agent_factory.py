"""
Agent Factory module for creating different types of agents.
This module provides a unified interface for creating agents of different types
without modifying the existing codebase.
"""

from typing import Dict, Any, List, Optional, Union
from openrouter_agent import create_openrouter_agent, get_weather, get_current_time

# Map of agent types to their factory functions
AGENT_FACTORIES = {
    "openrouter": create_openrouter_agent,
    # Add other agent types here as needed
}

def create_agent(
    agent_type: str,
    agent_id: str,
    name: str,
    model: str = None,
    description: str = None,
    tools: List = None,
    prompts: Dict[str, str] = None,
    sub_agents: List = None,
    **kwargs
):
    """
    Factory function to create an agent of the specified type.
    
    Args:
        agent_type: Type of agent to create (e.g., "openrouter", "adk")
        agent_id: Unique identifier for the agent
        name: Name of the agent
        model: Model to use for the agent
        description: Description of the agent
        tools: List of tools for the agent
        prompts: Dictionary of prompts for the agent
        sub_agents: List of sub-agents
        **kwargs: Additional arguments for the agent
        
    Returns:
        An agent instance of the specified type
    """
    # Default to openrouter if agent_type is not recognized
    factory = AGENT_FACTORIES.get(agent_type.lower(), create_openrouter_agent)
    
    # Process tools - convert string tool names to actual functions where possible
    processed_tools = []
    if tools:
        for tool in tools:
            if isinstance(tool, str):
                # Convert string tool names to actual functions if available
                if tool.lower() == "weather":
                    processed_tools.append(get_weather)
                elif tool.lower() == "time":
                    processed_tools.append(get_current_time)
                else:
                    # Keep as string if no matching function
                    processed_tools.append(tool)
            else:
                # Keep non-string tools as is
                processed_tools.append(tool)
    
    # Create the agent
    agent = factory(
        name=name,
        model=model,
        description=description,
        tools=processed_tools or None,
        prompts=prompts,
        sub_agents=sub_agents,
        **kwargs
    )
    
    # Add agent_id as an attribute for reference
    agent.id = agent_id
    
    return agent

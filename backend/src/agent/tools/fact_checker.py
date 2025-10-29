from crewai.tools import BaseTool
from typing import Type, Union, List
from pydantic import BaseModel, Field, field_validator


class FactCheckerInput(BaseModel):
    """Input schema for FactChecker."""
    claims: str = Field(..., description="Claims or statements to fact-check. Can be a single claim or multiple claims separated by newlines.")
    
    @field_validator('claims', mode='before')
    @classmethod
    def convert_list_to_string(cls, v):
        """Convert list of claims to string if needed."""
        if isinstance(v, list):
            return "\n".join(str(claim) for claim in v)
        return v


class FactCheckerTool(BaseTool):
    name: str = "Fact Checker"
    description: str = (
        "Performs online research to verify claims and statements. "
        "Searches for credible sources, cross-references information, "
        "and determines if claims are true, false, or unverified. "
        "Use this after extracting claims from video analysis. "
        "Input can be a single claim or multiple claims (will be processed together)."
    )
    args_schema: Type[BaseModel] = FactCheckerInput

    def _run(self, claims: str) -> str:
        """
        This tool leverages CrewAI's built-in search capabilities.
        The actual web search will be performed by the agent using this tool.
        """
        # Split claims if multiple
        claim_list = claims.split('\n')
        claim_count = len([c for c in claim_list if c.strip()])
        
        return f"""Ready to fact-check {claim_count} claim(s):

{claims}

Please search for credible sources and evidence to verify or debunk each claim. 
For each claim, provide:
- Verification status (TRUE/FALSE/MISLEADING/UNVERIFIED)
- Detailed evidence from multiple sources
- Source URLs with publication dates
- Confidence score"""

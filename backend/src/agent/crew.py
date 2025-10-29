from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai_tools import SerperDevTool
from typing import List

from agent.tools import VideoDownloaderTool, GeminiVideoAnalyzerTool, FactCheckerTool, BlogAnalyzerTool


@CrewBase
class VideoFactCheckerCrew():
    """Video Fact-Checking Agent Crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    @agent
    def video_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['video_analyst'],
            tools=[VideoDownloaderTool(), GeminiVideoAnalyzerTool(), BlogAnalyzerTool()],
            verbose=True
        )

    @agent
    def fact_checker(self) -> Agent:
        return Agent(
            config=self.agents_config['fact_checker'],
            tools=[SerperDevTool()],
            verbose=True
        )

    @agent
    def report_writer(self) -> Agent:
        return Agent(
            config=self.agents_config['report_writer'],
            verbose=True
        )

    @task
    def content_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['content_analysis_task'],
        )

    @task
    def fact_checking_task(self) -> Task:
        return Task(
            config=self.tasks_config['fact_checking_task'],
        )

    @task
    def report_generation_task(self) -> Task:
        return Task(
            config=self.tasks_config['report_generation_task'],
            output_file='fact_check_report.md'
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Video Fact-Checking crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

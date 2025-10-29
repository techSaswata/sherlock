#!/usr/bin/env python
import sys
import warnings
from datetime import datetime
from agent.crew import VideoFactCheckerCrew

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")


def run():
    """
    Run the fact-checking crew for videos or blogs.
    """
    # Get URL from command line or use default
    if len(sys.argv) > 1:
        video_url = sys.argv[1]
    else:
        video_url = input("Enter URL (YouTube/Instagram video or Blog/Article): ")
    
    inputs = {
        'video_url': video_url,
    }

    try:
        print(f"\n🔍 Starting fact-check analysis for: {video_url}\n")
        result = VideoFactCheckerCrew().crew().kickoff(inputs=inputs)
        print("\n✅ Fact-check complete! Report saved to: fact_check_report.md\n")
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


def train():
    """
    Train the crew for a given number of iterations.
    """
    inputs = {
        "video_url": "https://www.youtube.com/watch?v=example",
    }
    try:
        VideoFactCheckerCrew().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")


def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        VideoFactCheckerCrew().crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")


def test():
    """
    Test the crew execution and returns the results.
    """
    inputs = {
        "video_url": "https://www.youtube.com/watch?v=example",
    }

    try:
        VideoFactCheckerCrew().crew().test(n_iterations=int(sys.argv[1]), eval_llm=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")


def run_with_trigger():
    """
    Run the crew with trigger payload.
    """
    import json

    if len(sys.argv) < 2:
        raise Exception("No trigger payload provided. Please provide JSON payload as argument.")

    try:
        trigger_payload = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        raise Exception("Invalid JSON payload provided as argument")

    inputs = {
        "crewai_trigger_payload": trigger_payload,
        "video_url": trigger_payload.get("video_url", ""),
    }

    try:
        result = VideoFactCheckerCrew().crew().kickoff(inputs=inputs)
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew with trigger: {e}")

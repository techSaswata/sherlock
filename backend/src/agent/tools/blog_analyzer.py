from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import requests
from bs4 import BeautifulSoup
import re


class BlogAnalyzerInput(BaseModel):
    """Input schema for BlogAnalyzer."""
    url: str = Field(..., description="Blog or article URL to analyze")


class BlogAnalyzerTool(BaseTool):
    name: str = "Blog Analyzer"
    description: str = (
        "Analyzes blog posts and articles from URLs. "
        "Extracts the main content, title, author, publication date, "
        "and identifies key claims made in the article. "
        "Use this for analyzing written content from blogs and news sites."
    )
    args_schema: Type[BaseModel] = BlogAnalyzerInput

    def _run(self, url: str) -> str:
        """Analyze blog/article content from URL."""
        try:
            # Fetch the webpage
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title = soup.find('title')
            title_text = title.get_text().strip() if title else "No title found"
            
            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc.get('content', '') if meta_desc else ''
            
            # Extract main content (try common article tags)
            content = ""
            article_tags = soup.find_all(['article', 'main', 'div'], class_=re.compile(r'(content|article|post|entry)', re.I))
            
            if article_tags:
                for tag in article_tags[:1]:  # Take first match
                    paragraphs = tag.find_all('p')
                    content = '\n\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
                    if len(content) > 200:  # If we got substantial content
                        break
            
            # Fallback: get all paragraphs
            if len(content) < 200:
                paragraphs = soup.find_all('p')
                content = '\n\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
            
            # Limit content length for analysis
            if len(content) > 3000:
                content = content[:3000] + "...[content truncated for analysis]"
            
            # Extract author if available
            author_tag = soup.find(['meta', 'span', 'div'], attrs={'name': 'author'}) or \
                        soup.find(class_=re.compile(r'author', re.I))
            author = author_tag.get_text().strip() if author_tag and hasattr(author_tag, 'get_text') else \
                    author_tag.get('content', 'Unknown') if author_tag else 'Unknown'
            
            # Extract date if available
            date_tag = soup.find('time') or soup.find(['meta', 'span'], attrs={'property': 'article:published_time'})
            date = date_tag.get_text().strip() if date_tag and hasattr(date_tag, 'get_text') else \
                  date_tag.get('content', 'Unknown') if date_tag else 'Unknown'
            
            result = f"""
BLOG/ARTICLE ANALYSIS
=====================

URL: {url}
Title: {title_text}
Author: {author}
Date: {date}

Description: {description}

MAIN CONTENT:
{content}

ANALYSIS INSTRUCTIONS:
- Identify the main claims made in this article
- Focus on factual statements that can be verified
- Note any sensational or misleading language
- Check if sources are cited
- Assess credibility indicators
"""
            
            return result
            
        except requests.Timeout:
            return f"Error: Request timed out while fetching {url}"
        except requests.RequestException as e:
            return f"Error fetching blog content: {str(e)}"
        except Exception as e:
            return f"Error analyzing blog: {str(e)}"

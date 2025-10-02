---
title: Unit 1 AI Agent Course
date: 2025-10-01
tags: ["Hugging-Face", "Agents", "LLM"]
---

## AI Agents: What are they? 🕵🏻

Let's be clear off the bat, an AI agent isn't like Agent Smith from the Matrix. Well not yet at least...

An **AI agent** is essentially a system that can reason, plan, and interact with its environment to achieve a goal set by the user. It's a goal-oriented machine.

An agent is made up of two main components. The first is the **LLM** (Large Language Model), which is the **brain** of the system. The LLM allows the agent to understand your natural language, handle the reasoning, and plan the actions it will take. The second component is the **body**—the **tools** the agent uses to interact with the world. These tools can be simple programs the agent calls upon, or more complex APIs that access real-time data.

Think of existing smart assistants like Alexa or Siri as basic agentic systems—they hear a request, figure out a plan, and execute it.


## Thoughts, Actions, and Observations! Oh my!

The core mechanism that helps an agent work towards your solution is the **Thought-Action-Observation (TAO) cycle**. This process allows the agent to constantly adjust its behavior based on what it learns

In the **Thought** phase, the LLM analyzes the situation, breaks the user's request down into smaller steps, and plans what tool to use next.

In the **Action** phase, the agent interacts with its environment—usually by calling a tool.

The **Observation** phase is when the agent receives feedback from the environment. This feedback (whether it's data, an error message, or a successful output) is added to the agent's memory. This new data then informs and updates the agent's *next* **Thought** phase, creating a powerful, iterative loop.

Let's imagine you ask an agent to find a new coffee shop.

- **Thought:** _'User wants a coffee shop. I need to search the web for nearby shops, then check their ratings.'_
- **Action:** _Calls a web search tool with the query 'coffee shops near me'._
- **Observation:** _Receives a list of five shops and their addresses._
- The agent then starts the **Thought** cycle again, using this new data to decide which shop to recommend.

## What is really going on in that brain of an agent?

When we interact with the agent, it is crucial for the user to phrase what they want in order to "guide" the agent to doing what is desired of it. LLMs work by predicting the next "token" in a sequence. Tokens are essentially a part of a word that the LLM thinks will be correct in the situation.

But what happens behind the scenes? Essentially there a series of messages that are sent to the LLM. The basic structure of the messages have the roles of  *system*, *user*, and *assistant*. The **system** messages are important for the fact that they provide a set of persistent instructions of which defines the agent's behavior, personality and the tools it will have access to. There are also formatting requirements and special tokens that LLMs use. 

## The right tool for the right situation!

Since the brain doesn't really interact with the world, we need some tools that agent can use. **Tools** are essentially a function that the LLM is able to use to perform a specific task. For instance, you can have a tool that searches the web or calls upon an API. This allows for the agent to go beyond the static nature of an LLM and allows for accessing real-time information.

The trick is, the LLM doesn't execute the tool directly. It generates a text that will be represented as a tool call. They are usually either JSON object (created by **JSON Agents**) or a code snippet (created by **Code Agents**). When it creates that, the agent framework then runs the function from what the LLM created and then gives the result back to the LLM as an Observation.

To make sure the tool is reliable, there is a method called "Stop and Parse" approach. Essentially, after the LLM creates the JSON object (or code snippet), then it needs to stop generating tokens. After that, an external parser reads the output and executes the command. This should minimize the errors that occur.

## So much more to cover...

My mind feels like mush, either because it's really late or just from information overload. Either way, I hope this was useful! I did take the Unit 1 test for this and passed! You even receive a certificate for the achievement, which I've proudly added to my LinkedIn profile.

**Next up for Unit 2, I'll be diving into AI Agent Frameworks** like Smolagents, LlamaIndex, and LangGraph. If you've worked with any of these before, which one should I be most excited to explore? **Send me a message on LinkedIn**—I'd love to hear your thoughts and continue the conversation there!
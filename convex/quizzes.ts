import { v } from "convex/values";
import { mutation, query, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

export const getQuiz = query({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.id);
    if (!quiz) {
      throw new Error(`Quiz not found: ${args.id}`);
    }
    return quiz;
  },
});

export const createQuiz = mutation({
  args: { topic: v.string() },
  handler: async (ctx, { topic }) => {
    try {
      console.log('Creating quiz for topic:', topic);
      
      // First create the quiz
      const quizId = await ctx.db.insert("quizzes", {
        topic,
        modules: [],
        status: "generating",
      });
      
      console.log('Quiz created with ID:', quizId);

      // Schedule the content generation
      await ctx.scheduler.runAfter(0, internal.quizzes._generateContent, { 
        quizId, 
        topic 
    });
      
      console.log('Content generation scheduled');
      return quizId;
      
    } catch (error) {
      console.error('Error in createQuiz:', error);
      throw error;
    }
  },
});

// Internal mutation to update quiz
export const _updateQuizData = internalMutation({
  args: {
    quizId: v.id("quizzes"),
    modules: v.array(
      v.object({
        id: v.number(),
        title: v.string(),
        content: v.string(),
        questions: v.array(
          v.object({
            id: v.string(),
            question: v.string(),
            options: v.array(v.string()),
            correctAnswer: v.number(),
            explanation: v.string(),
          })
        ),
      })
    ),
    status: v.string(),
  },
  handler: async (ctx, { quizId, modules, status }) => {
    try {
      console.log('Updating quiz:', quizId, 'with status:', status);
      await ctx.db.patch(quizId, { modules, status });
      console.log('Quiz updated successfully');
    } catch (error) {
      console.error('Error in _updateQuizData:', error);
      throw error;
    }
  },
});

// Internal action for generation
export const _generateContent = internalAction({
  args: { 
    quizId: v.id("quizzes"),
    topic: v.string()
  },
  handler: async (ctx, { quizId, topic }) => {
    try {
      console.log('Starting content generation for topic:', topic);
      
      if (!process.env.CLAUDE_API_KEY) {
        throw new Error('CLAUDE_API_KEY is not set in environment variables');
      }

      const anthropic = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY,
      });

      console.log('Sending request to Claude API');
      
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.3,
        system: "You are a helpful teaching assistant that creates educational quizzes. Always respond with valid JSON that matches the expected schema.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Create an educational quiz about "${topic}". The response should be in JSON format similar to this structure:
                {
                  "modules": [
                    {
                      "id": 1,
                      "title": "Basic Concepts",
                      "content": "Detailed explanation of the topic...",
                      "questions": [
                        {
                          "id": "1a",
                          "question": "Question text here?",
                          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                          "correctAnswer": 0,
                          "explanation": "Explanation of the correct answer"
                        }
                      ]
                    }
                  ]
                }`,
              },
            ],
          },
        ],
      });

      console.log('Received response from Claude API');

      const content = response.content[0] as { type: 'text'; text: string };
      console.log('Claude response text:', content.text.substring(0, 200));  // Log first 200 chars

      const modules = JSON.parse(content.text).modules;
      console.log('Parsed modules:', JSON.stringify(modules).substring(0, 200));  // Log first 200 chars

      // Save the generated content using internal mutation
      await ctx.runMutation(internal.quizzes._updateQuizData, {
        quizId,
        modules,
        status: "complete",
      });

      console.log('Content generation completed successfully');

    } catch (error) {
      console.error('Error in _generateContent:', error);
      
      // Update error status using internal mutation
      await ctx.runMutation(internal.quizzes._updateQuizData, {
        quizId,
        modules: [],
        status: "error",
      });
      
      throw error;
    }
  },
});
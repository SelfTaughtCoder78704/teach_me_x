import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  quizzes: defineTable({
    topic: v.string(),
    status: v.string(),
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
  }),
});
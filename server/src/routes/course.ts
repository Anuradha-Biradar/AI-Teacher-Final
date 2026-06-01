import { Router, type Request, type Response } from "express";
import { generateObject, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import {
  insertCourse,
  insertModule,
  getAllCourses,
  getCourseById,
  getModulesByCourseId,
  updateModuleContent,
  updateModuleQuizScore,
  deleteCourse,
  type CourseRow,
  type ModuleRow,
} from "../db.js";

const router = Router();

// --- Helpers ---

function mapModuleRow(row: ModuleRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content ?? undefined,
    quiz: row.quiz ? JSON.parse(row.quiz) : undefined,
    isCompleted: row.is_completed === 1,
    quizScore: row.quiz_score ?? undefined,
  };
}

function mapCourseRow(course: CourseRow, modules: ModuleRow[]) {
  return {
    id: course.id,
    topic: course.topic,
    title: course.title,
    description: course.description,
    modules: modules.map(mapModuleRow),
    createdAt: course.created_at,
  };
}

// --- Routes ---

// GET /api/courses
router.get("/courses", (_req: Request, res: Response) => {
  const courses = getAllCourses();
  const result = courses.map((c) => {
    const modules = getModulesByCourseId(c.id);
    return mapCourseRow(c, modules);
  });
  res.json(result);
});

// GET /api/courses/:id
router.get("/courses/:id", (req: Request, res: Response) => {
  const course = getCourseById(req.params.id);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const modules = getModulesByCourseId(course.id);
  res.json(mapCourseRow(course, modules));
});

// POST /api/generate-syllabus
router.post("/generate-syllabus", async (req: Request, res: Response) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== "string") {
    res.status(400).json({ error: "Topic is required" });
    return;
  }

  try {
    const syllabusSchema = z.object({
      title: z.string().describe("The title of the course"),
      description: z.string().describe("A short, engaging description of the course outcomes"),
      modules: z
        .array(
          z.object({
            title: z.string().describe("Module title"),
            description: z.string().describe("What will be covered in this module"),
          })
        )
        .describe("List of modules"),
    });

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: syllabusSchema,
      prompt: `Create a comprehensive course syllabus for learning about: "${topic}".
The course should be broken down into 4-6 logical modules.
Ensure the title is catchy and the description is motivating.`,
    });

    const courseId = crypto.randomUUID();
    const course: CourseRow = {
      id: courseId,
      topic,
      title: object.title,
      description: object.description,
      created_at: Date.now(),
    };

    insertCourse(course);

    const modules = object.modules.map((m, index) => {
      const moduleId = crypto.randomUUID();
      const moduleRow = {
        id: moduleId,
        course_id: courseId,
        title: m.title,
        description: m.description,
        content: null,
        quiz: null,
        sort_order: index,
      };
      insertModule(moduleRow);
      return { ...moduleRow, is_completed: 0, quiz_score: null } as ModuleRow;
    });

    res.json(mapCourseRow(course, modules));
  } catch (error) {
    console.error("Error generating syllabus:", error);
    res.status(500).json({ error: "Failed to generate syllabus" });
  }
});

// POST /api/stream-lesson
router.post("/stream-lesson", async (req: Request, res: Response) => {
  const { courseId, moduleId, courseTitle, moduleTitle, moduleDescription } = req.body;

  if (!courseId || !moduleId || !courseTitle || !moduleTitle || !moduleDescription) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const prompt = `You are an expert and engaging teacher. You are teaching the module "${moduleTitle}" from the course "${courseTitle}".

Module Description: ${moduleDescription}

PART 1: THE LESSON
Structure your lesson in valid Markdown.
- Introduction
- Core Concepts (Explain clearly, use analogies)
- Examples/Code (if technical)
- Summary

PART 2: THE QUIZ
After the lesson, you MUST output a separator string exactly like this: "---QUIZ_START---"
Immediately after the separator, provide a valid JSON array of 3-5 objects representing multiple-choice questions.
Do NOT wrap the JSON in markdown code blocks. Just raw JSON text after the separator.

JSON Format per question:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": number (0-3 index of the correct option),
  "explanation": "string (brief explanation of why)"
}

Tone: Enthusiastic, clear, and encouraging.`;

  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    // Set up streaming response
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();

    let fullText = "";

    for await (const chunk of result.textStream) {
      fullText += chunk;
      res.write(chunk);
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    }

    res.end();

    // After streaming, save to DB in background
    const QUIZ_SEPARATOR = "---QUIZ_START---";
    const parts = fullText.split(QUIZ_SEPARATOR);
    const lessonText = parts[0];

    let quizData: any[] = [];
    if (parts[1]) {
      try {
        const jsonString = parts[1].replace(/```json/g, "").replace(/```/g, "").trim();
        quizData = JSON.parse(jsonString);
      } catch (e) {
        console.error("Failed to parse quiz JSON:", e);
      }
    }

    updateModuleContent(moduleId, lessonText, JSON.stringify(quizData));
  } catch (error) {
    console.error("Error streaming lesson:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream lesson" });
    } else {
      res.end();
    }
  }
});

// PUT /api/modules/:id/quiz-score
router.put("/modules/:id/quiz-score", (req: Request, res: Response) => {
  const { score, isCompleted } = req.body;
  if (typeof score !== "number" || typeof isCompleted !== "boolean") {
    res.status(400).json({ error: "score (number) and isCompleted (boolean) are required" });
    return;
  }
  updateModuleQuizScore(req.params.id, score, isCompleted);
  res.json({ success: true });
});

// DELETE /api/courses/:id
router.delete("/courses/:id", (req: Request, res: Response) => {
  deleteCourse(req.params.id);
  res.json({ success: true });
});

export default router;

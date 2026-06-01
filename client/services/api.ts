import { Course, QuizQuestion } from "../types";

const API_BASE = "/api";

export const generateSyllabus = async (topic: string): Promise<Course> => {
  const response = await fetch(`${API_BASE}/generate-syllabus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate syllabus: ${response.statusText}`);
  }

  return response.json();
};

export async function* streamLessonContent(
  courseId: string,
  moduleId: string,
  courseTitle: string,
  moduleTitle: string,
  moduleDescription: string
) {
  const response = await fetch(`${API_BASE}/stream-lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseId,
      moduleId,
      courseTitle,
      moduleTitle,
      moduleDescription,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to stream lesson: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await fetch(`${API_BASE}/courses`);
  if (!response.ok) throw new Error("Failed to fetch courses");
  return response.json();
};

export const getCourse = async (id: string): Promise<Course> => {
  const response = await fetch(`${API_BASE}/courses/${id}`);
  if (!response.ok) throw new Error("Failed to fetch course");
  return response.json();
};

export const deleteCourse = async (id: string): Promise<void> => {
  await fetch(`${API_BASE}/courses/${id}`, { method: "DELETE" });
};

export const updateQuizScore = async (
  moduleId: string,
  score: number,
  isCompleted: boolean
): Promise<void> => {
  await fetch(`${API_BASE}/modules/${moduleId}/quiz-score`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score, isCompleted }),
  });
};

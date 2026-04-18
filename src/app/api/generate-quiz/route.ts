import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import pdfParse from "pdf-parse";

const MODEL = process.env.MODEL_NAME || "openai/gpt-3.5-turbo";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const formData = await req.formData();
    const inputType = formData.get("inputType") as string;
    const topic = formData.get("topic") as string;
    const rawText = formData.get("rawText") as string;
    const questionCount = parseInt(formData.get("questionCount") as string) || 5;
    const difficulty = formData.get("difficulty") as string || "Medium";

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured." },
        { status: 401 }
      );
    }

    if (questionCount > 100) {
      return NextResponse.json(
        { error: "Maximum question count is 100." },
        { status: 400 }
      );
    }

    let contentToPrompt = "";

    if (inputType === "topic") {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required." }, { status: 400 });
      }
      contentToPrompt = `Topic: ${topic}`;
    }

    else if (inputType === "text") {
      if (!rawText) {
        return NextResponse.json({ error: "Text content is required." }, { status: 400 });
      }
      contentToPrompt = `Reference Text: ${rawText}`;
    }

    else if (inputType === "pdf") {
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No PDF uploaded." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await pdfParse(buffer);
      const extractedPdfText = pdfData.text;

      if (!extractedPdfText || extractedPdfText.length < 20) {
        return NextResponse.json(
          { error: "Could not extract enough text from PDF." },
          { status: 400 }
        );
      }

      const trimmedText =
        extractedPdfText.length > 12000
          ? extractedPdfText.substring(0, 12000) + "..."
          : extractedPdfText;

      contentToPrompt = `Reference Text:\n${trimmedText}`;
    }

    else {
      return NextResponse.json({ error: "Invalid input type." }, { status: 400 });
    }

    const systemPrompt = `
You are an expert quiz generator.

Generate EXACTLY ${questionCount} multiple-choice questions.

Difficulty: ${difficulty}

STRICT RULES:
- You MUST return EXACTLY ${questionCount} questions — no more, no less
- If you return fewer or more, the response is INVALID
- Output MUST be strictly valid JSON
- Do not include any text outside JSON

Format:
{
  "questions": [
    {
      "questionText": "",
      "answerA": "",
      "answerB": "",
      "answerC": "",
      "answerD": "",
      "correctAnswer": "A",
      "explanation": ""
    }
  ]
}
`;

    // ✅ OPENROUTER API CALL
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\n${contentToPrompt}`
          }
        ]
      })
    });

    const data = await response.json();

    const responseContent = data.choices?.[0]?.message?.content;

    if (!responseContent) {
      console.error(data);
      throw new Error("No response from AI");
    }

    // ✅ SAFE PARSE
    let parsedContent;
    try {
      parsedContent = JSON.parse(responseContent);
    } catch (err) {
      console.error("Raw AI response:", responseContent);
      throw new Error("AI returned invalid JSON. Try again.");
    }

    // ✅ ENFORCE EXACT QUESTION COUNT
    let questions = parsedContent.questions || [];
    questions = questions.slice(0, questionCount);
    if (questions.length < questionCount) {
      throw new Error(`AI returned ${questions.length} questions instead of ${questionCount}. Try again.`);
    }
    parsedContent.questions = questions;

    let quizTitle = "Untitled Quiz";

    if (inputType === "topic") quizTitle = topic;
    else if (inputType === "text") quizTitle = "Quiz from Text";
    else if (inputType === "pdf") {
      const file = formData.get("file") as File;
      quizTitle = `Quiz from ${file.name}`;
    }

    let savedQuiz = null;

    if (userId && parsedContent?.questions) {
      savedQuiz = await prisma.quiz.create({
        data: {
          title: quizTitle,
          topic: inputType,
          userId,
          questions: {
            create: parsedContent.questions.map((q: any) => ({
              questionText: q.questionText,
              answerA: q.answerA,
              answerB: q.answerB,
              answerC: q.answerC,
              answerD: q.answerD,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
          },
        },
        include: { questions: true },
      });
    }

    return NextResponse.json({
      success: true,
      quizId: savedQuiz?.id || null,
      title: quizTitle,
      questions: parsedContent.questions,
    });

  } catch (error: any) {
    console.error("Quiz generation error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
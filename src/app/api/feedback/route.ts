import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback, feedbackType, programName, programId } = body;

    if (!feedback || !feedbackType) {
      return NextResponse.json(
        { error: "Feedback and feedback type are required" },
        { status: 400 }
      );
    }

    // Get email configuration from environment variables
    const recipientEmail = process.env.FEEDBACK_EMAIL || process.env.EMAIL_RECIPIENT;
    const senderEmail = process.env.EMAIL_SENDER || "AnchorLabs <onboarding@resend.dev>";
    
    if (!recipientEmail) {
      console.error("FEEDBACK_EMAIL or EMAIL_RECIPIENT environment variable is not set");
      return NextResponse.json(
        { error: "Email configuration is missing. Please set FEEDBACK_EMAIL or EMAIL_RECIPIENT." },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: "Resend API key is not configured. Please set RESEND_API_KEY environment variable.",
          fallback: true 
        },
        { status: 503 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: [recipientEmail],
      subject: `[AnchorLabs Feedback] ${feedbackType.toUpperCase()}: ${programName || "General"}`,
      react: EmailTemplate({
        feedbackType,
        feedback,
        programName,
        programId,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Feedback sent successfully",
      data 
    });

  } catch (error) {
    console.error("Error sending feedback email:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to send feedback",
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    
    const { data, error } = await resend.domains.verify("5fafd768-b903-459c-a81e-1671e350db31");

    if (error) {
      return NextResponse.json(
        { 
          error: error.message || "Failed to list domains",
          details: error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      domains: data,
    });

  } catch (error) {
    console.error("Error listing Resend domains:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to list domains",
      },
      { status: 500 }
    );
  }
}


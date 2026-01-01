import * as React from "react";

interface EmailTemplateProps {
  feedbackType: string;
  feedback: string;
  programName?: string;
  programId?: string;
}

export function EmailTemplate({
  feedbackType,
  feedback,
  programName,
  programId,
}: EmailTemplateProps): React.JSX.Element {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#333", borderBottom: "2px solid #0070f3", paddingBottom: "10px" }}>
        AnchorLabs Feedback
      </h2>

      <div style={{ margin: "20px 0" }}>
        <p>
          <strong>Feedback Type:</strong>{" "}
          <span style={{ textTransform: "capitalize" }}>{feedbackType}</span>
        </p>
        <p>
          <strong>Program Name:</strong> {programName || "N/A"}
        </p>
        <p>
          <strong>Program ID:</strong> {programId || "N/A"}
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "15px",
          borderRadius: "5px",
          margin: "20px 0",
        }}
      >
        <h3 style={{ color: "#333", marginTop: 0 }}>Feedback:</h3>
        <p style={{ whiteSpace: "pre-wrap", color: "#555" }}>{feedback}</p>
      </div>

      <p style={{ color: "#888", fontSize: "12px", marginTop: "30px" }}>
        This feedback was submitted from the AnchorLabs dashboard.
      </p>
    </div>
  );
}


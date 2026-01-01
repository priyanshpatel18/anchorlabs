"use client";

import ProgramNotFound from "@/components/ProgramNotFound";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAutoReinitialize } from "@/hooks/useAutoReinitialize";
import useProgramStore from "@/stores/programStore";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Code,
  Copy,
  Database,
  Globe,
  LayoutGrid,
  ServerIcon,
  FlaskConical,
  Settings,
  AlertTriangle,
  MessageSquare,
  Send
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { syne } from "@/fonts/fonts";

export default function Dashboard() {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRpc, setCopiedRpc] = useState(false);
  const [showIdlDialog, setShowIdlDialog] = useState(false);
  const [idlCopied, setIdlCopied] = useState(false);
  const [showReconfigureDialog, setShowReconfigureDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "general">("general");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { programDetails, reset } = useProgramStore();
  const wallet = useAnchorWallet();
  const router = useRouter();
  useAutoReinitialize(wallet ?? undefined);

  const idlJson = programDetails?.serializedIdl
    ? JSON.stringify(JSON.parse(programDetails.serializedIdl), null, 2)
    : "";

  const copyToClipboard = async (
    text: string,
    setter: (value: boolean) => void
  ) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleReconfigure = () => {
    reset();
    setShowReconfigureDialog(false);
    router.push("/?setup=true");
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      return;
    }

    setIsSubmittingFeedback(true);
    
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          feedbackType,
          programName: programDetails?.name,
          programId: programDetails?.programId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If email service is not configured, fall back to mailto
        if (data.fallback) {
          const subject = encodeURIComponent(
            `[AnchorLabs Feedback] ${feedbackType.toUpperCase()}: ${programDetails?.name || "General"}`
          );
          const body = encodeURIComponent(
            `Feedback Type: ${feedbackType}\n\nFeedback:\n${feedback}\n\nProgram: ${programDetails?.name || "N/A"}\nProgram ID: ${programDetails?.programId || "N/A"}`
          );
          window.location.href = `mailto:feedback@solixdb.xyz?subject=${subject}&body=${body}`;
          
          toast.success("Opening email client", {
            description: "Please send the email to submit your feedback.",
          });
        } else {
          // Show the error message from the API
          const errorMessage = data.error || "Failed to send feedback";
          throw new Error(errorMessage);
        }
      } else {
        // Success
        toast.success("Feedback sent!", {
          description: "Thank you for your feedback. We'll get back to you soon.",
        });
      }

      // Reset form
      setFeedback("");
      setFeedbackType("general");
      setShowFeedbackDialog(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to send feedback", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (!programDetails) {
    return <ProgramNotFound />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto bg-gradient-to-b from-background via-background to-muted/20"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4 flex-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border-2 border-primary/20"
          >
            <Code className="h-8 w-8 text-primary" />
          </motion.div>
          <div>
            <h1 className={`${syne} text-2xl sm:text-3xl lg:text-4xl font-bold mb-2`}>
              {programDetails.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {programDetails.cluster}
              </span>
              <div className="hidden sm:block w-px h-4 bg-muted"></div>
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <span>Initialized</span>
                <span
                  className="font-mono font-medium"
                  title={new Date(programDetails.initializedAt).toLocaleString()}
                >
                  {formatDistanceToNow(new Date(programDetails.initializedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFeedbackDialog(true)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReconfigureDialog(true)}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Reconfigure</span>
          </Button>
        </motion.div>
      </motion.div>

      <AlertDialog open={showReconfigureDialog} onOpenChange={setShowReconfigureDialog}>
        <AlertDialogContent className="border-destructive/50">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-destructive">
                Reconfigure Program?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">
              This will reset your current program configuration and all associated data. 
              You&apos;ll need to set up a new program IDL and RPC endpoint.
              <br />
              <br />
              <strong className="text-foreground">This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReconfigure}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Reconfigure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showIdlDialog} onOpenChange={setShowIdlDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Complete IDL</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto relative">
            <button
              className="absolute top-3 right-3 z-10 text-xs bg-background px-3 py-1.5 rounded-md hover:bg-muted border shadow-sm"
              onClick={async () => {
                await navigator.clipboard.writeText(idlJson);
                setIdlCopied(true);
                setTimeout(() => setIdlCopied(false), 2000);
              }}
            >
              {idlCopied ? "Copied" : "Copy"}
            </button>
            <pre className="bg-muted rounded-lg p-5 text-xs font-mono overflow-x-auto border">
              {idlJson}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Share Your Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve AnchorLabs by sharing your thoughts, reporting bugs, or suggesting features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <select
                id="feedback-type"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as "bug" | "feature" | "general")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-message">Your Feedback</Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what you think, what you'd like to see, or any issues you've encountered..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px] resize-none"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFeedbackDialog(false);
                setFeedback("");
                setFeedbackType("general");
              }}
              disabled={isSubmittingFeedback}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={!feedback.trim() || isSubmittingFeedback}
              className="gap-2"
            >
              {isSubmittingFeedback ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col"
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg bg-primary/10"
              >
                <Globe className="h-5 w-5 text-primary" />
              </motion.div>
              <span className="text-base font-semibold">Program ID</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3"
              onClick={() =>
                copyToClipboard(programDetails.programId, setCopiedId)
              }
            >
              <AnimatePresence mode="wait">
                {copiedId ? (
                  <motion.span
                    key="copied"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
          <div className="font-mono text-sm bg-muted rounded-lg p-3.5 overflow-x-auto whitespace-nowrap mb-3.5 flex-1 flex items-center">
            {programDetails.programId}
          </div>
          <div className="mt-auto">
            <button
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors underline"
              onClick={() => setShowIdlDialog(true)}
            >
              View Complete IDL
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg bg-primary/10"
              >
                <ServerIcon className="h-5 w-5 text-primary" />
              </motion.div>
              <span className="text-base font-semibold">RPC Endpoint</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3"
              onClick={() =>
                copyToClipboard(programDetails.rpcUrl, setCopiedRpc)
              }
            >
              <AnimatePresence mode="wait">
                {copiedRpc ? (
                  <motion.span
                    key="copied"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
          <div className="font-mono text-sm bg-muted rounded-lg p-3.5 overflow-x-auto whitespace-nowrap">
            {programDetails.rpcUrl}
          </div>
          <div className="mt-5 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Commitment Level</span>
              <span className="font-medium">{programDetails.commitment}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Network</span>
              <span className="font-medium capitalize">{programDetails.cluster}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Link href="/accounts" className="block group">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 transition-all"
                  >
                    <LayoutGrid className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage program accounts
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
              </div>
              <div className="mt-5 p-3.5 bg-gradient-to-br from-muted/60 to-muted/40 rounded-lg border border-primary/5">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Quick Access</div>
                <div className="text-sm font-semibold">Browse all program accounts and their data</div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/instructions" className="block group">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 transition-all"
                  >
                    <Code className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Instructions</h3>
                    <p className="text-sm text-muted-foreground">
                      View and execute program instructions
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
              </div>
              <div className="mt-5 p-3.5 bg-gradient-to-br from-muted/60 to-muted/40 rounded-lg border border-primary/5">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Quick Access</div>
                <div className="text-sm font-semibold">Execute and test program instructions</div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <Link href="/test-suites" className="block group">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 transition-all"
                  >
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Test Suites</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and manage test suites for your program
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
              </div>
              <div className="mt-5 p-3.5 bg-gradient-to-br from-muted/60 to-muted/40 rounded-lg border border-primary/5">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Quick Access</div>
                <div className="text-sm font-semibold">
                  Organize and execute test cases
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/transactions" className="block group">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full cursor-pointer flex flex-col"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 transition-all"
                  >
                    <Database className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Transactions</h3>
                    <p className="text-sm text-muted-foreground">
                      View recent transactions and their status
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
              </div>
              <div className="mt-auto p-3.5 bg-gradient-to-br from-muted/60 to-muted/40 rounded-lg border border-primary/5">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Quick Access</div>
                <div className="text-sm font-semibold">Browse transaction history and status</div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
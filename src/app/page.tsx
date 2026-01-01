"use client";

import ProgramInitializationWizard from "@/components/ProgramWizard/ProgramInitializationWizard";
import LandingPage from "@/components/LandingPage";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import { Spinner } from "@/components/ui/8bit/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useAutoReinitialize } from "@/hooks/useAutoReinitialize";
import useProgramStore from "@/stores/programStore";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { IconCheck, IconRocket, IconSettings } from "@tabler/icons-react";
import { Code2, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { syne } from "@/fonts/fonts";

function HomePageContent() {
  const {
    isInitialized,
    program,
    programDetails,
    reset,
    isReinitializing,
    initialize,
  } = useProgramStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const shouldShowSetup = searchParams?.get("setup") === "true";

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useAutoReinitialize(wallet ?? undefined);

  // Auto-initialize with dummy wallet if we have programDetails
  useEffect(() => {
    if (programDetails && !program && !isInitialized && !isReinitializing) {
      const initializeProgram = async () => {
        try {
          const idl = JSON.parse(programDetails.serializedIdl);
          await initialize(
            idl,
            programDetails.rpcUrl,
            null, // No wallet needed for read-only initialization
            programDetails.commitment
          );
        } catch (error) {
          console.error("Auto-initialization failed:", error);
        }
      };
      initializeProgram();
    }
  }, [programDetails, program, isInitialized, isReinitializing, initialize]);

  const handleReset = () => {
    reset();
    setShowResetDialog(false);
    router.push("/");
  };

  if (loading) {
    return <WelcomeAnimation />;
  }

  // CASE 0: Program is currently reinitializing → show loader
  if (isReinitializing) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:gap-8 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-primary/10 border-2 border-primary/20"
          >
            <Code2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2 sm:space-y-3 px-4"
        >
          <h2 className={`${syne} text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent`}>
            Initializing Program
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            This will only take a moment
          </p>
        </motion.div>
      </div>
    );
  }

  // CASE 1: No saved programDetails → show landing page or setup wizard
  if (!programDetails) {
    if (shouldShowSetup) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-1 flex-col"
        >
          <ProgramInitializationWizard onComplete={() => router.push("/dashboard")} />
        </motion.div>
      );
    }
    return <LandingPage />;
  }

  // CASE 2: Have programDetails but not yet initialized → auto-initialize with dummy wallet
  if (!program || !isInitialized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-1 flex-col items-center justify-center gap-6 sm:gap-8 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-muted/20"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-primary/10 border-2 border-primary/20"
        >
          <Code2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2 px-4"
        >
          <h2 className={`${syne} text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent`}>
            Initializing Program
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Please wait...</p>
        </motion.div>
      </motion.div>
    );
  }

  // CASE 3: Program fully initialized and ready
  return (
    <>
      <div className="w-full h-screen flex flex-1 items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <Card className="w-full bg-card/95 backdrop-blur-sm border-2 border-primary/10 shadow-xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
                className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20"
              >
                <CheckCircle2 className="size-10 text-primary" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <CardTitle className={`${syne} text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent`}>
                  Program Ready!
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  Your Anchor program is initialized and ready to test
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Program Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 p-6 border border-primary/5"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Program Name
                    </p>
                    <p className="text-lg font-bold">{programDetails.name}</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Program ID
                    </p>
                    <p className="font-mono text-sm break-all">
                      {programDetails.programId}
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-muted-foreground">
                      RPC Endpoint
                    </p>
                    <p className="text-sm break-all">{programDetails.rpcUrl}</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col gap-3 sm:flex-row pt-2"
              >
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => setShowResetDialog(true)}
                >
                  <IconSettings className="h-5 w-5" />
                  Reconfigure
                </Button>
              </motion.div>

              {/* Info Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center text-sm text-muted-foreground"
              >
                You can reconfigure your program settings at any time from the dashboard
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
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
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Reconfigure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<WelcomeAnimation />}>
      <HomePageContent />
    </Suspense>
  );
}
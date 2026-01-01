"use client";

import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Connection } from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FlaskConical,
  Loader2,
  Play,
  Plus,
  Trash2,
  XCircle,
  Wallet,
  ExternalLink,
  Copy,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { RPCSelector } from "@/components/RPCSelector";
import { useAutoReinitialize } from "@/hooks/useAutoReinitialize";
import useProgramStore from "@/stores/programStore";
import useTestSuiteStore, { TestCase } from "@/stores/testSuiteStore";
import { executeTransaction } from "@/utils/transactionExecutor";
import { formatDistanceToNow } from "date-fns";
import { syne } from "@/fonts/fonts";
import ProgramNotFound from "@/components/ProgramNotFound";
import { Separator } from "@/components/ui/separator";

interface TestResult {
  testCaseId: string;
  status: "pending" | "running" | "success" | "failure";
  signature?: string;
  error?: string;
  duration?: number;
}

function detectClusterFromUrl(rpcUrl: string): string {
  const url = rpcUrl.toLowerCase();
  if (url.includes("devnet")) return "devnet";
  if (url.includes("testnet")) return "testnet";
  if (url.includes("mainnet-beta") || url.includes("mainnet")) return "mainnet-beta";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return "localnet";
  return "custom";
}

export default function TestSuitesPage() {
  const { program, programDetails } = useProgramStore();
  const { suites, deleteSuite, deleteTestCase, createSuite } = useTestSuiteStore();
  const wallet = useAnchorWallet();
  useAutoReinitialize(wallet ?? undefined);
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  const [executionRpcUrl, setExecutionRpcUrl] = useState<string>("");
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (programDetails && !executionRpcUrl) {
      setExecutionRpcUrl(programDetails.rpcUrl);
    }
  }, [programDetails, executionRpcUrl]);

  const executionConnection = useMemo(() => {
    if (executionRpcUrl) {
      return new Connection(executionRpcUrl);
    }
    return null;
  }, [executionRpcUrl]);

  const currentProgramSuites = suites.filter(
    (s) => s.programId === programDetails?.programId
  );

  const selectedSuite = currentProgramSuites.find((s) => s.id === selectedSuiteId);

  const handleCreateSuite = () => {
    if (!newSuiteName.trim()) {
      toast.error("Please enter a suite name");
      return;
    }
    const id = createSuite(newSuiteName, programDetails?.programId || "");
    setSelectedSuiteId(id);
    setNewSuiteName("");
    setCreateDialogOpen(false);
    toast.success("Test suite created!");
  };

  const handleRpcChange = async (newRpcUrl: string) => {
    try {
      setExecutionRpcUrl(newRpcUrl);
      const newCluster = detectClusterFromUrl(newRpcUrl);
      toast.success("Execution RPC Updated!", {
        description: `Tests will now execute on ${newCluster} network`,
      });
    } catch (err) {
      console.error("RPC update error:", err);
      toast.error("RPC Update Error", {
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  };

  const runSingleTest = async (testCase: TestCase) => {
    if (!program || !executionConnection) {
      toast.error("Program or connection not available");
      return;
    }

    if (!publicKey) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to execute tests",
      });
      setVisible(true);
      return;
    }

    const instruction = program.idl.instructions.find(
      (ix) => ix.name === testCase.instruction
    );

    if (!instruction) {
      toast.error(`Instruction ${testCase.instruction} not found`);
      return;
    }

    setTestResults((prev) => ({
      ...prev,
      [testCase.id]: { testCaseId: testCase.id, status: "running" },
    }));

    const startTime = Date.now();

    try {
      const result = await executeTransaction({
        program,
        instruction,
        args: testCase.args,
        accounts: testCase.accounts,
        connection: executionConnection,
        publicKey,
        sendTransaction,
        programTypes: programDetails?.types,
      });

      const duration = Date.now() - startTime;
      setTestResults((prev) => ({
        ...prev,
        [testCase.id]: {
          testCaseId: testCase.id,
          status: "success",
          signature: result.signature,
          duration,
        },
      }));
      toast.success("Test passed!", {
        description: `Transaction: ${result.signature.slice(0, 8)}...`,
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setTestResults((prev) => ({
        ...prev,
        [testCase.id]: {
          testCaseId: testCase.id,
          status: "failure",
          error: errorMessage,
          duration,
        },
      }));
      toast.error("Test failed", {
        description: errorMessage,
      });
    }
  };

  const runAllTests = async () => {
    if (!selectedSuite || !program || !executionConnection) {
      toast.error("Cannot run tests");
      return;
    }

    if (!publicKey) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to execute tests",
      });
      setVisible(true);
      return;
    }

    setIsRunning(true);
    setTestResults({});

    for (const testCase of selectedSuite.testCases) {
      await runSingleTest(testCase);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    const stats = getResultStats();
    toast.success("Test suite execution completed!", {
      description: `${stats.success}/${stats.total} tests passed`,
    });
  };

  const getResultStats = () => {
    const results = Object.values(testResults);
    return {
      total: results.length,
      success: results.filter((r) => r.status === "success").length,
      failure: results.filter((r) => r.status === "failure").length,
      running: results.filter((r) => r.status === "running").length,
    };
  };

  const stats = getResultStats();

  const copySignature = (signature: string) => {
    navigator.clipboard.writeText(signature);
    toast.success("Signature copied to clipboard");
  };

  if (!program || !programDetails) {
    return <ProgramNotFound />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto bg-gradient-to-b from-background via-background to-muted/20"
    >
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border-2 border-primary/20"
            >
              <FlaskConical className="h-7 w-7 text-primary" />
            </motion.div>
            <div>
              <h1 className={`${syne} text-2xl sm:text-3xl lg:text-4xl font-bold mb-2`}>
                Test Suites
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Create, manage, and execute test suites for {programDetails.name || "your program"}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            {executionRpcUrl && (
              <RPCSelector
                currentRpcUrl={executionRpcUrl}
                onRpcChange={handleRpcChange}
              />
            )}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 h-11 font-medium">
                  <Plus className="h-4 w-4" />
                  New Suite
                </Button>
              </DialogTrigger>
              <DialogContent className="backdrop-blur-md bg-background/95 border-border/50">
                <DialogHeader>
                  <DialogTitle>Create Test Suite</DialogTitle>
                  <DialogDescription>
                    Create a new test suite for {programDetails.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2.5">
                    <Label htmlFor="suite-name" className="text-sm font-medium">Suite Name</Label>
                    <Input
                      id="suite-name"
                      placeholder="e.g., Integration Tests"
                      value={newSuiteName}
                      onChange={(e) => setNewSuiteName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateSuite();
                        }
                      }}
                      className="h-11"
                    />
                  </div>
                  <Button onClick={handleCreateSuite} className="w-full h-11 font-medium" disabled={!newSuiteName.trim()}>
                    Create Suite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>

        {!publicKey && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Alert className="backdrop-blur-sm bg-background/80 border border-border/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
                <span>Connect your wallet to execute test suites</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVisible(true)}
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="lg:col-span-1 backdrop-blur-sm bg-card/95 border border-border/50 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Test Suites</CardTitle>
              <CardDescription>
                {currentProgramSuites.length} suite{currentProgramSuites.length !== 1 ? "s" : ""} for this program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {currentProgramSuites.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground mb-4">
                    No test suites yet. Create one to get started!
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Suite
                  </Button>
                </div>
              ) : (
                currentProgramSuites.map((suite, index) => (
                  <motion.div
                    key={suite.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedSuiteId === suite.id
                        ? "border-primary bg-primary/10 shadow-sm backdrop-blur-sm"
                        : "hover:bg-muted/50 hover:border-primary/20 border-border/50"
                    }`}
                    onClick={() => setSelectedSuiteId(suite.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate mb-1.5">{suite.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="text-xs font-normal">
                            {suite.testCases.length} test{suite.testCases.length !== 1 ? "s" : ""}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(suite.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${suite.name}"?`)) {
                            deleteSuite(suite.id);
                            if (selectedSuiteId === suite.id) {
                              setSelectedSuiteId(null);
                            }
                            toast.success("Test suite deleted");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 backdrop-blur-sm bg-card/95 border border-border/50 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold mb-1">
                    {selectedSuite ? selectedSuite.name : "Select a Suite"}
                  </CardTitle>
                  {selectedSuite && (
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span>{selectedSuite.testCases.length} test case{selectedSuite.testCases.length !== 1 ? "s" : ""}</span>
                      {selectedSuite.testCases.length > 0 && stats.total > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 dark:text-green-400">{stats.success} passed</span>
                          {stats.failure > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-red-600 dark:text-red-400">{stats.failure} failed</span>
                            </>
                          )}
                        </>
                      )}
                    </CardDescription>
                  )}
                </div>
                {selectedSuite && selectedSuite.testCases.length > 0 && (
                  <Button
                    onClick={runAllTests}
                    disabled={isRunning || !publicKey || !executionConnection}
                    className="gap-2 h-11 font-medium"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Run All
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedSuite ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a test suite to view its test cases</p>
                </div>
              ) : selectedSuite.testCases.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No test cases yet.</p>
                  <p className="text-sm">
                    Add tests from the{" "}
                    <a
                      href="/instructions"
                      className="text-primary hover:underline font-medium"
                    >
                      Instruction Builder
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.total > 0 && (
                    <div className="flex gap-2 flex-wrap pb-2">
                      <Badge variant="outline" className="font-medium">Total: {stats.total}</Badge>
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 font-medium">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Success: {stats.success}
                      </Badge>
                      {stats.failure > 0 && (
                        <Badge variant="destructive" className="font-medium">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failure: {stats.failure}
                        </Badge>
                      )}
                      {stats.running > 0 && (
                        <Badge variant="outline" className="font-medium">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Running: {stats.running}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <AnimatePresence>
                      {selectedSuite.testCases.map((testCase, index) => {
                        const result = testResults[testCase.id];
                        return (
                          <motion.div
                            key={testCase.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-lg border border-border/50 bg-muted/40 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{testCase.name}</h4>
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {testCase.instruction}
                                  </Badge>
                                </div>
                                {testCase.description && (
                                  <p className="text-sm text-muted-foreground">{testCase.description}</p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {result ? (
                                  <Badge
                                    variant={
                                      result.status === "success"
                                        ? "default"
                                        : result.status === "failure"
                                        ? "destructive"
                                        : "outline"
                                    }
                                    className="gap-1.5 font-medium"
                                  >
                                    {result.status === "running" && (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    )}
                                    {result.status === "success" && (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    {result.status === "failure" && (
                                      <XCircle className="h-3 w-3" />
                                    )}
                                    {result.status}
                                    {result.duration && ` (${result.duration}ms)`}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="font-medium">Not run</Badge>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => runSingleTest(testCase)}
                                  disabled={
                                    isRunning ||
                                    !publicKey ||
                                    !executionConnection ||
                                    result?.status === "running"
                                  }
                                  title="Run this test"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => {
                                    if (confirm(`Delete "${testCase.name}"?`)) {
                                      deleteTestCase(selectedSuite.id, testCase.id);
                                      toast.success("Test case deleted");
                                    }
                                  }}
                                  title="Delete test case"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            {result && (
                              <div className="pt-2 border-t border-border/50 space-y-2">
                                {result.signature && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <code className="text-muted-foreground bg-muted/60 px-2 py-1 rounded font-mono flex-1 truncate">
                                      {result.signature.slice(0, 12)}...{result.signature.slice(-12)}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => copySignature(result.signature!)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <a
                                      href={`https://solscan.io/tx/${result.signature}?cluster=${detectClusterFromUrl(executionRpcUrl)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                )}
                                {result.error && (
                                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                                    {result.error}
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

"use client";

import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Connection } from "@solana/web3.js";
import { AnimatePresence, motion } from "framer-motion";
import { Code, Loader2, Rocket, Terminal, WalletIcon, Zap, Save, Plus, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AccountInput } from "@/components/instruction/AccountInput";
import { ArgumentInput } from "@/components/instruction/ArgumentInput";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/instruction/NotificationToasts";
import ProgramNotFound from "@/components/ProgramNotFound";
import { RPCSelector } from "@/components/RPCSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAutoReinitialize } from "@/hooks/useAutoReinitialize";
import { useInstructionForm } from "@/hooks/useInstructionForm";
import { usePDAManager } from "@/hooks/usePDAManager";
import useProgramStore from "@/stores/programStore";
import useTestSuiteStore from "@/stores/testSuiteStore";
import { TransactionResult } from "@/types";
import { resolveType } from "@/utils/argProcessor";
import { formatInstructionName, formatInstructions } from "@/utils/instructionUtils";
import { executeTransaction } from "@/utils/transactionExecutor";
import { isFormValid } from "@/utils/validationUtils";
import { syne } from "@/fonts/fonts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

function detectClusterFromUrl(rpcUrl: string): string {
  const url = rpcUrl.toLowerCase();
  
  if (url.includes("devnet")) return "devnet";
  if (url.includes("testnet")) return "testnet";
  if (url.includes("mainnet-beta") || url.includes("mainnet")) return "mainnet-beta";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return "localnet";
  
  return "custom";
}

export default function InstructionBuilderPage() {
  const { program, programDetails } = useProgramStore();
  const { suites, addTestCase, createSuite } = useTestSuiteStore();
  const wallet = useAnchorWallet();
  useAutoReinitialize(wallet ?? undefined);
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  const [executionRpcUrl, setExecutionRpcUrl] = useState<string>("");

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

  const [selectedIx, setSelectedIx] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showError, setShowError] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [testCaseName, setTestCaseName] = useState("");
  const [selectedSuiteForSave, setSelectedSuiteForSave] = useState<string>("");

  const instructions = program?.idl?.instructions;
  const formattedInstructions = useMemo(
    () => (instructions ? formatInstructions(instructions) : []),
    [instructions]
  );

  const instruction = useMemo(
    () => instructions?.find((ix) => ix.name === selectedIx),
    [instructions, selectedIx]
  );

  const { args, accounts, handleArgChange, handleAccountChange } =
    useInstructionForm({
      instruction,
      programTypes: programDetails?.types,
    });

  const pdaManager = usePDAManager({
    program,
    onAccountChange: handleAccountChange,
  });

  const formValid = isFormValid(instruction, args, accounts);

  const currentProgramSuites = suites.filter(
    (s) => s.programId === programDetails?.programId
  );

  const initialSelectedIx = useMemo(
    () => (formattedInstructions.length > 0 ? formattedInstructions[0].name : ""),
    [formattedInstructions]
  );

  useEffect(() => {
    if (initialSelectedIx && !selectedIx) {
      setSelectedIx(initialSelectedIx);
    }
  }, [initialSelectedIx, selectedIx]);

  const handleRpcChange = async (newRpcUrl: string) => {
    try {
      setExecutionRpcUrl(newRpcUrl);
      
      const newCluster = detectClusterFromUrl(newRpcUrl);
      
      toast.success("Execution RPC Updated!", {
        description: `Instructions will now execute on ${newCluster} network`,
      });
    } catch (err) {
      console.error("RPC update error:", err);
      toast.error("RPC Update Error", {
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  };

  const handleSaveTestCase = () => {
    if (!testCaseName.trim()) {
      toast.error("Please enter a test case name");
      return;
    }

    if (!instruction) {
      toast.error("No instruction selected");
      return;
    }

    let suiteId = selectedSuiteForSave;

    if (selectedSuiteForSave === "new") {
      suiteId = createSuite("New Test Suite", programDetails?.programId || "");
    }

    if (!suiteId) {
      toast.error("Please select or create a suite");
      return;
    }

    addTestCase(suiteId, {
      name: testCaseName,
      instruction: instruction.name,
      args,
      accounts,
    });

    toast.success("Test case saved!", {
      description: `Added to suite successfully`,
    });

    setTestCaseName("");
    setSelectedSuiteForSave("");
    setSaveDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!program || !instruction || !executionConnection) {
      setError("Program, instruction, or connection not available");
      return;
    }

    if (!publicKey) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to execute instructions",
      });
      setVisible(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const txResult = await executeTransaction({
        program,
        instruction,
        args,
        accounts,
        connection: executionConnection,
        publicKey,
        sendTransaction,
        programTypes: programDetails?.types,
      });

      setResult(txResult);
      setShowResult(true);
      toast.success("Transaction sent", {
        description: "Your transaction was successfully sent to the network.",
      });
    } catch (err) {
      console.error("Transaction failed:", err);
      if (err instanceof Error) {
        setError(err.message || "An unknown error occurred");
        setShowError(true);
        toast.error("Transaction failed", {
          description: err.message || "An unknown error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!program || !programDetails) {
    return <ProgramNotFound />;
  }

  if (!instructions || instructions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-64"
      >
        <p className="text-muted-foreground">
          No instructions found in the program IDL.
        </p>
      </motion.div>
    );
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
              <Zap className="h-7 w-7 text-primary" />
            </motion.div>
            <div>
              <h1 className={`${syne} text-2xl sm:text-3xl lg:text-4xl font-bold mb-2`}>
                Instruction Builder
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Execute instructions from the {programDetails?.name || "selected"}{" "}
                program
              </p>
            </div>
          </div>

          {/* RPC Selector for Execution Environment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex-shrink-0"
          >
            <RPCSelector
              currentRpcUrl={executionRpcUrl}
              onRpcChange={handleRpcChange}
            />
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
                <span>Connect your wallet to execute instructions</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVisible(true)}
                  className="gap-2"
                >
                  <WalletIcon className="h-4 w-4" />
                  Connect Wallet
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {formattedInstructions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
          <Tabs
            value={selectedIx}
            onValueChange={setSelectedIx}
            defaultValue={initialSelectedIx}
            className="w-full"
          >
              <div className="overflow-x-auto pb-2 -mx-1 px-1">
                <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-background/80 backdrop-blur-md border border-border/50 shadow-xl p-1.5 w-auto min-w-full sm:min-w-0">
                  {formattedInstructions.map((ix, index) => (
                    <motion.div
                      key={ix.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                  <TabsTrigger
                    value={ix.name}
                        className="text-sm font-semibold px-5 py-2.5 whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:backdrop-blur-sm data-[state=active]:outline-1 data-[state=active]:outline-primary/20 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-primary/5 data-[state=inactive]:hover:backdrop-blur-sm rounded-lg transition-all duration-200"
                  >
                    {ix.displayName}
                  </TabsTrigger>
                    </motion.div>
                ))}
              </TabsList>
            </div>

              {formattedInstructions.map((formattedIx) => {
                const currentInstruction = instructions?.find(
                  (ix) => ix.name === formattedIx.name
                );

                if (!currentInstruction) return null;

                return (
              <TabsContent
                    key={currentInstruction.name}
                    value={currentInstruction.name}
                className="mt-4 flex flex-col flex-1 overflow-hidden"
              >
                    <AnimatePresence mode="wait">
                      {selectedIx === currentInstruction.name && (
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="w-full flex flex-col flex-1 overflow-hidden backdrop-blur-sm bg-card/95 border border-border/50 shadow-xl">
                            <CardHeader className="flex-shrink-0 pb-4">
                              <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                                  <CardTitle className="text-2xl font-bold mb-2">
                                    {formatInstructionName(currentInstruction.name)}
                        </CardTitle>
                                  {currentInstruction.docs &&
                                    currentInstruction.docs[0] && (
                                      <CardDescription className="text-base mb-3">
                                        {currentInstruction.docs[0]}
                          </CardDescription>
                        )}
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-medium">
                                      {currentInstruction.args.length} Args
                          </Badge>
                                    <Badge variant="outline" className="text-xs font-medium">
                                      {currentInstruction.accounts.length} Accounts
                          </Badge>
                        </div>
                      </div>

                                <div className="flex-shrink-0 flex gap-3 flex-wrap">
                                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                                    <TooltipProvider delayDuration={200}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="lg"
                                              disabled={!formValid || !publicKey}
                                              className="gap-2.5 px-5 h-11 font-medium transition-all [.solana_&]:hover:backdrop-blur-md [.solana_&]:hover:bg-gradient-to-r [.solana_&]:hover:from-purple-500/25 [.solana_&]:hover:to-purple-500/15 [.solana_&]:hover:border-purple-500/40 [.solana_&]:hover:text-white [.solana_&]:hover:[&_*]:text-white [.solana_&]:[&:hover]:bg-gradient-to-r [.solana_&]:[&:hover]:from-purple-500/25 [.solana_&]:[&:hover]:to-purple-500/15 [.solana_&]:[&:hover]:bg-accent/0 [.solana_&]:hover:shadow-lg"
                                            >
                                              <Save className="h-4 w-4" />
                                              Save Test
                                            </Button>
                                          </DialogTrigger>
                                        </TooltipTrigger>
                                        {(!formValid || !publicKey) && (
                                          <TooltipContent>
                                            <p>
                                              {!publicKey
                                                ? "Connect your wallet to save test cases."
                                                : "Please fill in all required fields."}
                                            </p>
                                          </TooltipContent>
                                        )}
                                      </Tooltip>
                                    </TooltipProvider>
                                    <DialogContent className="backdrop-blur-md bg-background/95 border-border/50">
                                      <DialogHeader>
                                        <DialogTitle>Save Test Case</DialogTitle>
                                        <DialogDescription>
                                          Save this instruction configuration to a test suite
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-5 py-4">
                                        <div className="space-y-2.5">
                                          <Label htmlFor="test-name" className="text-sm font-medium">Test Case Name</Label>
                                          <Input
                                            id="test-name"
                                            placeholder="e.g., Initialize with admin"
                                            value={testCaseName}
                                            onChange={(e) => setTestCaseName(e.target.value)}
                                            className="h-11"
                                          />
                                        </div>
                                        <div className="space-y-2.5">
                                          <Label htmlFor="suite-select" className="text-sm font-medium">Select Test Suite</Label>
                                          <Select
                                            value={selectedSuiteForSave}
                                            onValueChange={setSelectedSuiteForSave}
                                          >
                                            <SelectTrigger id="suite-select" className="h-11">
                                              <SelectValue placeholder="Choose a suite" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="new">
                                                <div className="flex items-center gap-2">
                                                  <Plus className="h-4 w-4" />
                                                  Create New Suite
                                                </div>
                                              </SelectItem>
                                              {currentProgramSuites.map((suite) => (
                                                <SelectItem key={suite.id} value={suite.id}>
                                                  {suite.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <Button
                                          onClick={handleSaveTestCase}
                                          className="w-full h-11 font-medium"
                                          disabled={!testCaseName.trim() || !selectedSuiteForSave}
                                        >
                                          Save Test Case
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button
                                onClick={handleSubmit}
                                          disabled={!formValid || isLoading || !publicKey}
                                size="lg"
                                          className="gap-2.5 px-6 h-11 font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Executing...
                                  </>
                                ) : !publicKey ? (
                                  <>
                                    <WalletIcon className="h-4 w-4" />
                                    Connect Wallet
                                  </>
                                ) : (
                                  <>
                                    <Rocket className="h-4 w-4" />
                                    Execute
                                  </>
                                )}
                              </Button>
                          </TooltipTrigger>
                          {!publicKey ? (
                            <TooltipContent>
                              <p>Connect your wallet to execute.</p>
                            </TooltipContent>
                                      ) : !formValid ? (
                            <TooltipContent>
                              <p>Please fill in all required fields.</p>
                            </TooltipContent>
                          ) : null}
                        </Tooltip>
                      </TooltipProvider>
                                </div>
                    </div>
                  </CardHeader>

                            <CardContent className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-8 min-h-0">
                              {currentInstruction.args.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="space-y-4"
                                >
                                  <div className="flex items-center gap-3 pb-2.5 border-b border-border/50">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                      <Code className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Arguments</h3>
                        </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {currentInstruction.args.map((arg, index) => {
                                      const resolvedType = resolveType(
                                        arg.type,
                                        programDetails?.types
                                      );
                            return (
                                        <ArgumentInput
                                          key={arg.name}
                                          name={arg.name}
                                    type={arg.type}
                                          value={args[arg.name]}
                                          onChange={(value) =>
                                            handleArgChange(arg.name, value)
                                          }
                                          resolvedType={resolvedType}
                                          index={index}
                                        />
                            );
                          })}
                        </div>
                                </motion.div>
                              )}

                              {currentInstruction.args.length > 0 &&
                                currentInstruction.accounts.length > 0 && (
                                  <Separator className="my-3" />
                                )}

                              {/* Accounts Section */}
                              {currentInstruction.accounts.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="space-y-4"
                                >
                                  <div className="flex items-center gap-3 pb-2.5 border-b border-border/50">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                      <Terminal className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Accounts</h3>
                              </div>
                                  <div className="space-y-3">
                                    {currentInstruction.accounts.map((account, index) => (
                                      <AccountInput
                                        key={account.name}
                                        name={account.name}
                                        value={accounts[account.name] || ""}
                                        onChange={(value) =>
                                          handleAccountChange(account.name, value)
                                        }
                                        account={account}
                                        index={index}
                                        publicKey={publicKey}
                                        pdaDialogOpen={pdaManager.pdaDialogOpen}
                                        onPdaDialogChange={pdaManager.setPdaDialogOpen}
                                        pdaSeeds={pdaManager.pdaSeeds}
                                        onAddPdaSeed={pdaManager.addPdaSeed}
                                        onRemovePdaSeed={pdaManager.removePdaSeed}
                                        onUpdatePdaSeed={pdaManager.updatePdaSeed}
                                        onDerivePda={() =>
                                          pdaManager.derivePDAForAccount(account.name)
                                        }
                                      />
                          ))}
                        </div>
                                </motion.div>
                    )}
                  </CardContent>
                </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
              </TabsContent>
                );
              })}
          </Tabs>
          </motion.div>
        ) : (
          <Card className="flex items-center justify-center h-[200px]">
            <CardContent>
              <p className="text-muted-foreground">
                No instructions available to display in tabs.
              </p>
            </CardContent>
          </Card>
        )}

        {result && showResult && (
          <SuccessToast
            result={result}
            rpcUrl={executionRpcUrl}
            onClose={() => setShowResult(false)}
          />
        )}
        {error && showError && (
          <ErrorToast error={error} onClose={() => setShowError(false)} />
        )}
      </div>
    </motion.div>
  );
}
"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAccountSignatures from "@/hooks/useAccontSignatures";
import useProgramStore from "@/stores/programStore";
import { 
  BitcoinIcon, 
  Loader2, 
  SearchIcon, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Clock
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { syne } from "@/fonts/fonts";

const TransactionTable = dynamic(
  () =>
    import("@/components/TransactionTable").then(
      (mod) => mod.TransactionTable
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const programId = useProgramStore((state) => state.programDetails?.programId);

  const {
    data: signatures,
    isLoading,
    error,
    isError,
  } = useAccountSignatures({
    address: programId || "",
    enabled: !!programId,
  });

  const transactions =
    signatures?.map((sig) => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: sig.blockTime,
      err: sig.err,
      memo: sig.memo,
      status: sig.err ? ("Error" as const) : ("Success" as const),
    })) || [];

  const stats = useMemo(() => {
    const total = transactions.length;
    const successful = transactions.filter(tx => tx.status === "Success").length;
    const failed = transactions.filter(tx => tx.status === "Error").length;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : "0";
    
    return { total, successful, failed, successRate };
  }, [transactions]);

  if (!programId) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-center text-muted-foreground">
              Please initialize a program first to view transactions.
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Loading transactions...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md"
          >
            <h3 className="font-medium text-destructive mb-2">
              Failed to load transactions
            </h3>
            <p className="text-sm text-muted-foreground">
              {error?.message ||
                "An error occurred while fetching transaction data."}
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto bg-gradient-to-b from-background via-background to-muted/20"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4"
        >
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
            <BitcoinIcon className="h-7 w-7 text-primary" />
          </motion.div>
          <div>
            <h1 className={`${syne} text-2xl sm:text-3xl lg:text-4xl font-bold mb-2`}>
              Transactions
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View and search through transaction history for this program
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">transactions</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Successful</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.successful}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.successRate}% success rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Failed</span>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</div>
                  <p className="text-xs text-muted-foreground mt-1">errors</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{stats.successRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">overall</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
            <Input
              placeholder="Search by signature, slot, or status..."
              className="pl-9 h-11 w-full bg-background/80 backdrop-blur-sm border-2 border-primary/10 shadow-sm transition-all duration-200 focus:shadow-md focus:border-primary/30"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Transaction Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full"
          layout
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={query}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TransactionTable data={transactions} filter={query.trim()} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
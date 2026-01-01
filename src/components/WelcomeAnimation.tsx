"use client";

import { Code2 } from "lucide-react";
import { syne } from "@/fonts/fonts";
import { motion } from "framer-motion";

export default function WelcomeAnimation() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 z-50">
      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex items-center justify-center gap-4"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-primary/10 border-2 border-primary/20"
          >
            <Code2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
          </motion.div>
          <h1
            className={`${syne} text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent`}
          >
            AnchorLabs
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-center"
        >
          <p className="text-base md:text-lg font-medium text-muted-foreground">
            The Ultimate Solana DevTool
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.4,
            ease: "easeOut",
          }}
          className="mt-4"
        >
          <div className="flex gap-2">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="size-2.5 rounded-full bg-primary"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                delay: 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="size-2.5 rounded-full bg-primary"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                delay: 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="size-2.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
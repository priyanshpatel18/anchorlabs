"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Database, 
  FlaskConical, 
  FileJson, 
  Upload, 
  Globe,
  ArrowRight,
  Github,
  ExternalLink,
  Zap,
  CheckCircle2,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { syne } from "@/fonts/fonts";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <FileJson className="h-6 w-6" />,
      title: "Upload IDL",
      description: "Upload your Anchor program IDL file or paste it directly",
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Get from Address",
      description: "Automatically fetch IDL from a deployed program address",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Explore Accounts",
      description: "View and inspect all program accounts and their data",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Execute Instructions",
      description: "Test and execute program instructions with ease",
    },
    {
      icon: <FlaskConical className="h-6 w-6" />,
      title: "Test Suites",
      description: "Create and manage test suites for your program",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "PDA Derivation",
      description: "Derive program derived addresses with custom seeds",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Upload IDL",
      description: "Upload your IDL file, use the JSON editor, or fetch from a program address",
    },
    {
      number: "2",
      title: "Configure Connection",
      description: "Set your RPC endpoint and network connection",
    },
    {
      number: "3",
      title: "Explore & Test",
      description: "Browse accounts, execute instructions, and run test suites",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center space-y-8"
          >
            {/* SolixDB Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Badge variant="outline" className="text-xs px-3 py-1">
                <span className="text-muted-foreground">A project by</span>
                <a 
                  href="https://solixdb.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1.5 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  SolixDB
                </a>
              </Badge>
            </motion.div>

            {/* Big AnchorLabs Branding */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-primary/10 border-2 border-primary/20"
                >
                  <Code2 className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
                </motion.div>
                <h1 className={`${syne} text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent`}>
                  AnchorLabs
                </h1>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center"
              >
                <p className="text-base sm:text-lg font-medium text-muted-foreground">
                  The Ultimate Solana DevTool
                </p>
              </motion.div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Test and interact with Solana Anchor programs directly in your browser. 
              <span className="text-foreground font-semibold"> No setup. No hassle.</span> Just pure developer experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Button
                size="lg"
                onClick={() => router.push("/?setup=true")}
                className="gap-2 text-base px-8"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="gap-2 text-base px-8"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${syne} text-4xl sm:text-5xl font-bold mb-4`}
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Get started in three simple steps. No complexity, just results.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
            >
              <Card className="h-full border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-2xl border border-primary/20 group-hover:border-primary/40 transition-colors"
                    >
                      {step.number}
                    </motion.div>
                    <div className="flex-1 pt-1">
                      <CardTitle className="text-xl sm:text-2xl font-bold mb-2">{step.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-muted/30 via-muted/20 to-transparent border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`${syne} text-4xl sm:text-5xl font-bold mb-4`}
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to build, test, and deploy Solana programs
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl hover:border-primary/30 transition-all duration-300 group bg-card/80 backdrop-blur-sm border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4 mb-3">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/30 transition-all"
                      >
                        {feature.icon}
                      </motion.div>
                      <div className="flex-1 pt-1">
                        <CardTitle className="text-lg sm:text-xl font-bold">{feature.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm sm:text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SolixDB Promotion Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30"
                    >
                      <Database className="h-10 w-10 text-primary" />
                    </motion.div>
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h3 className={`${syne} text-2xl sm:text-3xl font-bold mb-2`}>
                        Built by SolixDB
                      </h3>
                      <p className="text-muted-foreground text-base sm:text-lg">
                        AnchorLabs is a side project of <strong className="text-foreground">SolixDB</strong>, 
                        the Solana data platform trusted by developers. 
                        <span className="text-foreground font-medium"> Same team, same quality.</span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="gap-2"
                    >
                      <a href="https://solixdb.xyz" target="_blank" rel="noopener noreferrer">
                        Learn More About SolixDB
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground">
            Start testing your Solana programs today. No installation required.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/?setup=true")}
            className="gap-2 text-base px-8"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer with Social Links */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <span className={`${syne} text-2xl font-bold`}>AnchorLabs</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                A project by{" "}
                <a 
                  href="https://solixdb.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  SolixDB
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/solixdb/anchorlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a
                href="https://x.com/solixdb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-label="X logo">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="hidden sm:inline">X</span>
              </a>
              <a
                href="https://solixdb.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
                <span className="hidden sm:inline">SolixDB</span>
              </a>
            </div>
          </div>
        
          <div className="mt-8 pt-8 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>Built for Solana developers. Open source and free to use.</p>
              <p>
                Powered by{" "}
                <a 
                  href="https://solixdb.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  SolixDB
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


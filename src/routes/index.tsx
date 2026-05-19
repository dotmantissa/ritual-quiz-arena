import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Sparkles, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectWallet, sendSelfTx, shortAddress, RITUAL_CHAIN } from "@/lib/ritual-chain";
import { QUESTION_POOL, pickRandom, type Question } from "@/lib/questions";
import { Quiz } from "@/components/Quiz";
import { Leaderboard } from "@/components/Leaderboard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Ritual Quiz — Web3 trivia on the Ritual network" },
      { name: "description", content: "Connect your wallet, answer 10 timed questions, sign a tx on Ritual, and climb the leaderboard." },
    ],
  }),
});

type Phase = "connect" | "welcome" | "quiz" | "result" | "submitted";

function Index() {
  const [phase, setPhase] = useState<Phase>("connect");
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const onConnect = async () => {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      setPhase("welcome");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const onStart = () => {
    setQuestions(pickRandom(QUESTION_POOL, 10));
    setScore(0);
    setPhase("quiz");
  };

  const onComplete = (s: number) => {
    setScore(s);
    setPhase("result");
  };

  const onSubmit = async () => {
    if (!address) return;
    setSubmitting(true);
    try {
      toast.info("Confirm the transaction in your wallet…");
      const hash = await sendSelfTx(address);
      setTxHash(hash);
      const { error } = await supabase.from("leaderboard").insert({
        wallet_address: address.toLowerCase(),
        display_name: displayName.trim() || null,
        score,
        tx_hash: hash,
      });
      if (error) throw error;
      toast.success("Score recorded on the leaderboard.");
      setPhase("submitted");
    } catch (e) {
      const msg = (e as Error).message || "Transaction failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen grid-bg">
      <Toaster theme="dark" position="top-center" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border/60 backdrop-blur-sm bg-background/40 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/15 border border-primary/40 grid place-items-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono text-sm tracking-widest uppercase">Ritual / Quiz</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="hidden sm:inline text-muted-foreground">
            chain <span className="text-foreground">{RITUAL_CHAIN.id}</span>
          </span>
          {address ? (
            <span className="px-3 py-1.5 rounded-md border border-border bg-card font-mono text-xs">
              {shortAddress(address)}
            </span>
          ) : (
            <span className="text-muted-foreground">not connected</span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20">
        {phase === "connect" && (
          <section className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
              testnet · {RITUAL_CHAIN.symbol}
            </p>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
              Prove your <span className="text-gradient">web3</span> mind.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Ten questions. Ten seconds each. One on-chain signature seals your spot on the Ritual leaderboard.
            </p>
            <div className="mt-10">
              <Button size="lg" onClick={onConnect} disabled={connecting} className="glow-primary px-8 h-12 text-base">
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </Button>
            </div>
            <div className="mt-16">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Top players</h3>
              <div className="rounded-xl border border-border bg-card/40 backdrop-blur px-4">
                <Leaderboard />
              </div>
            </div>
          </section>
        )}

        {phase === "welcome" && address && (
          <section className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6">connected</p>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Welcome, <span className="font-mono text-gradient">{shortAddress(address)}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              You'll get 10 random questions. 10 seconds each. Choose wisely.
            </p>
            <div className="mt-10 flex justify-center gap-3">
              <Button size="lg" onClick={onStart} className="glow-primary px-8 h-12 text-base">
                Start quiz
              </Button>
            </div>
          </section>
        )}

        {phase === "quiz" && (
          <section className="pt-4">
            <Quiz questions={questions} onComplete={onComplete} />
          </section>
        )}

        {phase === "result" && (
          <section className="max-w-xl mx-auto text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">your score</p>
            <div className="text-8xl md:text-9xl font-semibold tracking-tighter text-gradient leading-none">
              {score}
              <span className="text-muted-foreground/40 text-5xl">/10</span>
            </div>
            <p className="mt-6 text-muted-foreground">
              Sign a small <span className="font-mono text-foreground">0.001 {RITUAL_CHAIN.symbol}</span> self-transfer
              to anchor your score on the Ritual leaderboard.
            </p>

            <div className="mt-8 space-y-3 text-left">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Display name <span className="opacity-50">(optional)</span>
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={32}
                placeholder="anon"
                className="bg-card/60"
              />
            </div>

            <Button
              size="lg"
              onClick={onSubmit}
              disabled={submitting}
              className="mt-6 w-full glow-primary h-12 text-base"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              Sign & submit
            </Button>
          </section>
        )}

        {phase === "submitted" && (
          <section className="max-w-2xl mx-auto">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-semibold">You're on the board.</h2>
              <p className="mt-3 text-muted-foreground">
                Score of <span className="text-foreground font-mono">{score}/10</span> recorded.
              </p>
              {txHash && (
                <a
                  href={`${RITUAL_CHAIN.explorer}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-mono text-primary hover:underline"
                >
                  {shortAddress(txHash)} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="mt-12">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 text-center">
                Leaderboard
              </h3>
              <div className="rounded-xl border border-border bg-card/40 backdrop-blur px-4">
                <Leaderboard highlightWallet={address ?? undefined} />
              </div>
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhase("welcome");
                    setTxHash(null);
                  }}
                >
                  Play again
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="px-6 md:px-10 py-8 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Ritual testnet · RPC {RITUAL_CHAIN.rpcUrl}
      </footer>
    </div>
  );
}

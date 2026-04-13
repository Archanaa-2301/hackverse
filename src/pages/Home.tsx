import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  Upload, 
  Users, 
  AlertCircle, 
  RefreshCcw,
  ChevronRight,
  Terminal,
  Zap,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";
import { LeaderboardEntry } from "../types";
import { cn } from "@/src/lib/utils";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [team, setTeam] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // Refresh every 30 seconds as a fallback
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !team || !name) {
      toast.error("Please fill all fields and select a CSV file.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("team", team);
    formData.append("name", name);
    formData.append("file", file);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      // Debugging HTML response errors
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error("Server returned an invalid response. Please check the console for details.");
      }

      const data = await response.json();

      if (response.ok) {
        const score = data.submission.score;
        toast.success(`Submission successful! Score: ${score}%`);
        setFile(null);
        setTeam("");
        setName("");
        fetchLeaderboard();
        document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        toast.error(data.error || "Submission failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-32">
      {/* Hero / Submission Section */}
      <section className="grid lg:grid-cols-2 gap-20 items-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest"
            >
              <Zap className="w-3 h-3" />
              Live Evaluation System
            </motion.div>
            <h2 className="text-7xl font-black tracking-tighter leading-[0.85] uppercase italic">
              PUSH YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">LIMITS</span>
            </h2>
            <p className="text-xl text-white/60 max-w-md leading-relaxed font-medium">
              Submit your dataset and claim your spot on the leaderboard.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
          
          <Card className="glass border-white/10 p-10 space-y-10 relative overflow-hidden group rounded-[2rem]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-3xl -mr-20 -mt-20 group-hover:bg-cyan-500/20 transition-all" />
            
            <div className="space-y-3">
              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                <Upload className="text-cyan-400 w-6 h-6" />
                SUBMISSION PORTAL
              </h3>
              <p className="text-sm text-white/40 font-medium">One attempt per team. Make it count.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Team Name</label>
                  <Input 
                    id="team"
                    placeholder="e.g. ALPHA_CORE" 
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="bg-black/40 border-white/10 focus:border-cyan-400/50 h-14 text-white placeholder:text-white/10 rounded-2xl font-bold italic"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Team Captain</label>
                  <Input 
                    id="name"
                    placeholder="e.g. Sarah Connor" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/40 border-white/10 focus:border-cyan-400/50 h-14 text-white placeholder:text-white/10 rounded-2xl font-bold italic"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Solution File (.csv)</label>
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-[1.5rem] p-10 flex flex-col items-center justify-center gap-5 transition-all cursor-pointer group/upload relative overflow-hidden",
                    file ? "border-cyan-400/50 bg-cyan-400/5" : "border-white/10 hover:border-cyan-400/30 hover:bg-white/5"
                  )}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input 
                    id="file-upload"
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-cyan-400/20 rounded-2xl flex items-center justify-center neon-glow-blue rotate-3">
                        <FileSpreadsheet className="text-cyan-400 w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-cyan-400 font-black text-lg italic uppercase">{file.name}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1">{(file.size / 1024).toFixed(2)} KB // Ready for Evaluation</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:rotate-6 transition-all duration-500">
                        <Upload className="text-white/20 w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 font-bold text-base">Drop your CSV here</p>
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2">CSV files only</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-black uppercase tracking-[0.3em] italic rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-all duration-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-4">
                    <RefreshCcw className="w-6 h-6 animate-spin" />
                    EVALUATING...
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    SUBMIT SOLUTION
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="space-y-16 py-20">
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest"
          >
            <Trophy className="w-3 h-3" />
            Global Rankings
          </motion.div>
          <h2 className="text-6xl font-black tracking-tighter uppercase italic">
            HALL OF <span className="text-cyan-400">LEGENDS</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="glass border-white/10 overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10 hover:bg-transparent h-16">
                    <TableHead className="w-32 text-center font-black text-[10px] text-white/30 uppercase tracking-[0.3em] italic">Rank</TableHead>
                    <TableHead className="text-[10px] text-white/30 uppercase tracking-[0.3em] italic font-black">Team Identity</TableHead>
                    <TableHead className="text-[10px] text-white/30 uppercase tracking-[0.3em] italic font-black">Lead Developer</TableHead>
                    <TableHead className="text-right text-[10px] text-white/30 uppercase tracking-[0.3em] italic font-black">Accuracy Score</TableHead>
                    <TableHead className="text-right text-[10px] text-white/30 uppercase tracking-[0.3em] italic font-black">Submission Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.length === 0 ? (
                    <TableRow key="no-submissions">
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Terminal className="w-12 h-12" />
                          <p className="font-mono uppercase tracking-[0.4em] text-sm">Waiting for incoming data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <TableRow 
                        key={`leaderboard-row-${entry.id}-${index}`} 
                        className="border-white/5 hover:bg-white/5 transition-all duration-300 group h-24"
                      >
                        <TableCell className="text-center">
                          <div className={cn(
                            "inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black font-mono text-xl italic transition-all duration-500",
                            entry.rank === 1 ? "bg-cyan-400 text-black shadow-[0_0_30px_rgba(34,211,238,0.6)] scale-110" :
                            entry.rank === 2 ? "bg-white/20 text-white border border-white/20" :
                            entry.rank === 3 ? "bg-purple-600/40 text-purple-400 border border-purple-600/50" :
                            "text-white/30"
                          )}>
                            {entry.rank.toString().padStart(2, '0')}
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-2xl text-white uppercase italic tracking-tighter group-hover:text-cyan-400 transition-colors">
                          {entry.team}
                        </TableCell>
                        <TableCell className="text-white/60 font-bold text-base">
                          {entry.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-6">
                            <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden hidden xl:block">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${entry.score}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                  "h-full shadow-[0_0_15px_currentColor]",
                                  entry.score > 80 ? "bg-cyan-400" : entry.score > 50 ? "bg-purple-500" : "bg-pink-500"
                                )}
                              />
                            </div>
                            <span className="font-mono font-black text-3xl italic text-white text-glow">{entry.score.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-white/40 font-mono text-sm uppercase tracking-[0.1em] font-bold">
                          {entry.time}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}

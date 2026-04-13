"use client";

import React, { useState } from "react";
import Papa from "papaparse";
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
import { cn } from "@/src/lib/utils";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [team, setTeam] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // ✅ NEW WORKING LOGIC (NO BACKEND)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !team || !name) {
      toast.error("Please fill all fields and select a CSV file.");
      return;
    }

    setIsSubmitting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const parsedData = results.data;

        if (!parsedData || parsedData.length === 0) {
          toast.error("Invalid CSV file.");
          setIsSubmitting(false);
          return;
        }

        // 🔥 SIMPLE SCORE (you can change later)
        let score = parsedData.length;
        if (score > 100) score = 100;

        const newEntry = {
          id: Date.now(),
          team: team,
          name: name,
          score: score,
          time: new Date().toLocaleTimeString(),
          rank: 0,
        };

        let updated = [...leaderboard];

        // ✅ same team best score
        let found = -1;
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].team.toLowerCase() === team.toLowerCase()) {
            found = i;
            break;
          }
        }

        if (found !== -1) {
          if (score > updated[found].score) {
            updated[found] = newEntry;
          }
        } else {
          updated.push(newEntry);
        }

        // sort
        updated.sort((a, b) => b.score - a.score);

        // rank
        for (let i = 0; i < updated.length; i++) {
          updated[i].rank = i + 1;
        }

        setLeaderboard(updated);

        toast.success(`Submission successful! Score: ${score}%`);

        setFile(null);
        setTeam("");
        setName("");
        setIsSubmitting(false);
      },
      error: function () {
        toast.error("CSV parsing failed.");
        setIsSubmitting(false);
      },
    });
  };

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-32">
      {/* Hero Section */}
      <section className="grid lg:grid-cols-2 gap-20 items-center min-h-[70vh]">
        <motion.div className="space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              Live Evaluation System
            </div>
            <h2 className="text-7xl font-black tracking-tighter leading-[0.85] uppercase italic">
              PUSH YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">LIMITS</span>
            </h2>
            <p className="text-xl text-white/60 max-w-md leading-relaxed font-medium">
              Submit your dataset and claim your spot on the leaderboard.
            </p>
          </div>
        </motion.div>

        <Card className="glass border-white/10 p-10 space-y-10 rounded-[2rem]">
          <div className="space-y-3">
            <h3 className="text-2xl font-black uppercase flex items-center gap-3 italic">
              <Upload className="text-cyan-400 w-6 h-6" />
              SUBMISSION PORTAL
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <Input value={team} onChange={(e)=>setTeam(e.target.value)} placeholder="Team Name" required />
              <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Team Captain" required />
            </div>

            <input type="file" accept=".csv" onChange={(e)=>setFile(e.target.files?.[0] || null)} />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "EVALUATING..." : "SUBMIT SOLUTION"}
            </Button>
          </form>
        </Card>
      </section>

      {/* Leaderboard */}
      <section className="space-y-16 py-20">
        <h2 className="text-6xl font-black text-center">Leaderboard</h2>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leaderboard.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No submissions yet
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.rank}</TableCell>
                    <TableCell>{entry.team}</TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.score}%</TableCell>
                    <TableCell>{entry.time}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </section>
    </main>
  );
}

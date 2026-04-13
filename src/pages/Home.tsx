import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  Upload,
  RefreshCcw,
  ChevronRight,
  Terminal,
  Zap,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [team, setTeam] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Load leaderboard from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    setLeaderboard(data);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !team || !name) {
      toast.error("Please fill all fields and select a CSV file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reader = new FileReader();

      reader.onload = function (event: any) {
        const text = event.target.result;

        const rows = text.split("\n").map((r: string) => r.split(","));

        console.log("CSV DATA:", rows);

        // 🔥 TEMP SCORE (we can replace with real logic later)
        const score = Math.random() * 100;

        let data = JSON.parse(localStorage.getItem("leaderboard") || "[]");

        const newEntry = {
          id: Date.now(),
          team: team.toUpperCase(),
          name,
          score,
          time: new Date().toLocaleString(),
          rawTime: Date.now()
        };

        data.push(newEntry);

        // SORT
        data.sort((a: any, b: any) => {
          if (b.score === a.score) return a.rawTime - b.rawTime;
          return b.score - a.score;
        });

        // RANK
        data = data.map((item: any, index: number) => ({
          ...item,
          rank: index + 1
        }));

        // TOP 15
        data = data.slice(0, 15);

        localStorage.setItem("leaderboard", JSON.stringify(data));

        setLeaderboard(data);

        toast.success(`Submission successful! Score: ${score.toFixed(2)}%`);

        setFile(null);
        setTeam("");
        setName("");

        document
          .getElementById("leaderboard")
          ?.scrollIntoView({ behavior: "smooth" });
      };

      reader.readAsText(file);
    } catch (error) {
      console.error(error);
      toast.error("Error processing file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 space-y-20">
      {/* SUBMISSION */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 text-xs">
            <Zap className="w-3 h-3" />
            Live Evaluation
          </div>
          <h2 className="text-5xl font-black">
            PUSH YOUR <span className="text-cyan-400">LIMITS</span>
          </h2>
        </div>

        <Card className="p-6 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Submit CSV
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Team Name"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
            />
            <Input
              placeholder="Participant Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit <ChevronRight />
                </>
              )}
            </Button>
          </form>
        </Card>
      </section>

      {/* LEADERBOARD */}
      <section id="leaderboard">
        <h2 className="text-4xl font-bold flex items-center gap-2 mb-6">
          <Trophy className="text-yellow-400" /> Leaderboard
        </h2>

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
                  <TableCell colSpan={5} className="text-center py-10">
                    <Terminal className="mx-auto mb-2" />
                    No submissions yet
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.rank}</TableCell>
                    <TableCell className="font-bold">
                      {entry.team}
                    </TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.score.toFixed(2)}%</TableCell>
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

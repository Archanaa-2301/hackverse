import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  AlertCircle, 
  Lock,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";
import { LeaderboardEntry } from "../types";
import { cn } from "@/src/lib/utils";

export default function Admin() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminFile, setAdminFile] = useState<File | null>(null);
  const [isAdminUploading, setIsAdminUploading] = useState(false);
  const [datasetStatus, setDatasetStatus] = useState<{ loaded: boolean; entries: number }>({ loaded: false, entries: 0 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchDatasetStatus = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setDatasetStatus({ loaded: data.datasetLoaded, entries: data.datasetEntries });
    } catch (error) {
      console.error("Failed to fetch dataset status:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/admin/submissions");
      if (response.ok) {
        const data = await response.json();
        const leaderboardData = data.map((s: any, index: number) => ({
          ...s,
          rank: index + 1,
        }));
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error("Admin submissions fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDatasetStatus();
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === "hackverse@123" && adminPassword === "Hack@1234") {
      setIsAuthorized(true);
      toast.success("Access Granted.");
    } else {
      toast.error("Invalid Admin Credentials.");
    }
  };

  const handleAdminUpload = async () => {
    if (!adminFile) return;
    setIsAdminUploading(true);
    const formData = new FormData();
    formData.append("file", adminFile);

    try {
      const response = await fetch("/api/admin/upload-correct", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        toast.success("Real dataset uploaded successfully!");
        setAdminFile(null);
        fetchDatasetStatus();
      } else {
        toast.error("Failed to upload dataset.");
      }
    } catch (error) {
      toast.error("Admin upload failed.");
    } finally {
      setIsAdminUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsAdminUploading(true);
      // Reset server-side
      const response = await fetch("/api/admin/reset", { method: "POST" });
      
      if (response.ok) {
        toast.success("Leaderboard reset successful.");
        setShowResetConfirm(false);
        fetchSubmissions();
      } else {
        toast.error("Reset failed.");
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Reset failed.");
    } finally {
      setIsAdminUploading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await fetch("/api/admin/download-excel");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "submissions.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error("Excel file not found or not yet generated.");
      }
    } catch (error) {
      toast.error("Failed to download Excel file.");
    }
  };

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {!isAuthorized ? (
          <Card className="glass border-cyan-400/30 p-10 space-y-6 rounded-[2rem] max-w-md mx-auto">
            <div className="text-center space-y-2">
              <Lock className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase italic">Access Restricted</h3>
              <p className="text-xs text-white/40 font-bold tracking-widest uppercase">Enter Admin Credentials</p>
            </div>
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Admin ID</label>
                <Input 
                  type="text" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="bg-black/40 border-white/10 focus:border-cyan-400/50 h-12 text-white text-center rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-black/40 border-white/10 focus:border-cyan-400/50 h-12 text-white text-center rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest h-12 rounded-xl italic mt-4">
                AUTHORIZE
              </Button>
            </form>
          </Card>
        ) : (
          <div className="space-y-10">
            <Card className="glass border-cyan-400/30 p-10 space-y-10 rounded-[2rem]">
              <div className="flex items-center justify-between border-b border-white/10 pb-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-cyan-400 italic">
                    <Lock className="w-6 h-6" />
                    COMMAND CENTER
                  </h3>
                  <p className="text-xs text-white/40 font-bold tracking-widest uppercase">System Overrides // Authorized Personnel Only</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsAuthorized(false);
                    setAdminId("");
                    setAdminPassword("");
                  }}
                  className="text-[10px] text-white/30 hover:text-white"
                >
                  Logout
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Ground Truth Dataset
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</span>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", datasetStatus.loaded ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-red-500")} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", datasetStatus.loaded ? "text-cyan-400" : "text-red-500")}>
                          {datasetStatus.loaded ? `LOADED (${datasetStatus.entries} ROWS)` : "NOT LOADED"}
                        </span>
                      </div>
                    </div>
                    <Input 
                      type="file" 
                      accept=".csv" 
                      onChange={(e) => setAdminFile(e.target.files?.[0] || null)}
                      className="bg-black/40 border-white/10 text-white text-xs h-12 rounded-xl"
                    />
                    <Button 
                      onClick={handleAdminUpload} 
                      disabled={isAdminUploading}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-[0.3em] h-12 rounded-xl italic"
                    >
                      {isAdminUploading ? "SYNCING..." : "SYNC MASTER DATASET"}
                    </Button>
                    <Button 
                      onClick={handleDownloadExcel} 
                      variant="outline"
                      className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 font-black text-[10px] uppercase tracking-[0.3em] h-12 rounded-xl italic"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      DOWNLOAD EXCEL (.xlsx)
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Danger Zone
                  </h4>
                  <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-6">
                    <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">
                      Wipe all submission data and reset rankings to zero. This action is irreversible.
                    </p>
                    {!showResetConfirm ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setShowResetConfirm(true)} 
                        className="w-full font-black text-[10px] uppercase tracking-[0.3em] h-12 rounded-xl italic"
                      >
                        FACTORY RESET
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={handleReset} 
                          className="flex-1 font-black text-[10px] uppercase tracking-[0.3em] h-12 rounded-xl italic"
                        >
                          CONFIRM WIPE
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowResetConfirm(false)} 
                          className="flex-1 border-white/10 text-white/50 font-black text-[10px] uppercase tracking-[0.3em] h-12 rounded-xl italic"
                        >
                          CANCEL
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Submissions Database */}
            <Card className="glass border-white/10 p-10 rounded-[2rem] overflow-hidden">
              <div className="space-y-6 mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                  <Users className="text-cyan-400 w-6 h-6" />
                  SUBMISSIONS DATABASE
                </h3>
                <p className="text-xs text-white/40 font-bold tracking-widest uppercase">Full log of all participant attempts</p>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-[10px] text-white/30 uppercase tracking-[0.3em] italic font-black">Team Name</TableHead>
                      <TableHead className="text-[10px] text-white/30 uppercase tracking-[0.3em] italic font-black">Participant</TableHead>
                      <TableHead className="text-right text-[10px] text-white/30 uppercase tracking-[0.3em] italic font-black">Score</TableHead>
                      <TableHead className="text-right text-[10px] text-white/30 uppercase tracking-[0.3em] italic font-black">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-white/20 font-mono uppercase tracking-widest text-xs">
                          No submissions in database
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaderboard.map((entry, index) => (
                        <TableRow key={`admin-db-${entry.team}-${index}`} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-bold text-white uppercase italic">{entry.team}</TableCell>
                          <TableCell className="text-white/60">{entry.name}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-cyan-400">{entry.score}%</TableCell>
                          <TableCell className="text-right text-white/40 font-mono text-sm">
                            {entry.time}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </motion.section>
    </main>
  );
}

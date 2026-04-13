"use client";

import React, { useState } from "react";
import Papa from "papaparse";
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
import { cn } from "@/src/lib/utils";

export default function Admin() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminFile, setAdminFile] = useState<File | null>(null);
  const [isAdminUploading, setIsAdminUploading] = useState(false);
  const [datasetStatus, setDatasetStatus] = useState<{ loaded: boolean; entries: number }>({ loaded: false, entries: 0 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ✅ AUTH SAME
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === "hackverse@123" && adminPassword === "Hack@1234") {
      setIsAuthorized(true);
      toast.success("Access Granted.");
    } else {
      toast.error("Invalid Admin Credentials.");
    }
  };

  // 🔥 FIXED UPLOAD (NO BACKEND)
  const handleAdminUpload = () => {
    if (!adminFile) {
      toast.error("Please select CSV file");
      return;
    }

    setIsAdminUploading(true);

    Papa.parse(adminFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const data = results.data;

        if (!data || data.length === 0) {
          toast.error("Invalid dataset");
          setIsAdminUploading(false);
          return;
        }

        setDatasetStatus({
          loaded: true,
          entries: data.length,
        });

        toast.success(`Dataset loaded: ${data.length} rows`);

        setIsAdminUploading(false);
      },
      error: function () {
        toast.error("CSV parsing failed");
        setIsAdminUploading(false);
      },
    });
  };

  // 🔥 RESET (LOCAL ONLY)
  const handleReset = () => {
    setLeaderboard([]);
    setDatasetStatus({ loaded: false, entries: 0 });
    setShowResetConfirm(false);
    toast.success("Leaderboard reset successful.");
  };

  // 🔥 DOWNLOAD CSV
  const handleDownloadExcel = () => {
    if (leaderboard.length === 0) {
      toast.error("No data to download");
      return;
    }

    const headers = Object.keys(leaderboard[0]);
    let csv = headers.join(",") + "\n";

    for (let i = 0; i < leaderboard.length; i++) {
      let row = "";
      for (let j = 0; j < headers.length; j++) {
        row += leaderboard[i][headers[j]];
        if (j < headers.length - 1) row += ",";
      }
      csv += row + "\n";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "submissions.csv";
    a.click();
  };

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
      <motion.section className="max-w-4xl mx-auto">
        {!isAuthorized ? (
          <Card className="glass border-cyan-400/30 p-10 space-y-6 rounded-[2rem] max-w-md mx-auto">
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <Input value={adminId} onChange={(e)=>setAdminId(e.target.value)} placeholder="Admin ID"/>
              <Input type="password" value={adminPassword} onChange={(e)=>setAdminPassword(e.target.value)} placeholder="Password"/>
              <Button type="submit" className="w-full">AUTHORIZE</Button>
            </form>
          </Card>
        ) : (
          <div className="space-y-10">
            <Card className="glass border-cyan-400/30 p-10 space-y-10 rounded-[2rem]">

              <Input type="file" accept=".csv" onChange={(e)=>setAdminFile(e.target.files?.[0] || null)} />

              <Button onClick={handleAdminUpload}>
                {isAdminUploading ? "SYNCING..." : "SYNC MASTER DATASET"}
              </Button>

              <Button onClick={handleDownloadExcel}>
                DOWNLOAD CSV
              </Button>

              <Button onClick={handleReset}>
                RESET
              </Button>

            </Card>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.team}</TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </motion.section>
    </main>
  );
}

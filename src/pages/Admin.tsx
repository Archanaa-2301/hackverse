"use client";

import React, { useState, useEffect } from "react";
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
  const [datasetStatus, setDatasetStatus] = useState({ loaded: false, entries: 0 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ✅ load submissions
  useEffect(() => {
    const saved = localStorage.getItem("leaderboard");
    if (saved) setLeaderboard(JSON.parse(saved));
  }, []);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === "hackverse@123" && adminPassword === "Hack@1234") {
      setIsAuthorized(true);
      toast.success("Access Granted.");
    } else {
      toast.error("Invalid credentials");
    }
  };

  // 🔥 SAVE DATASET
  const handleAdminUpload = () => {
    if (!adminFile) return;

    Papa.parse(adminFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const data = results.data;

        localStorage.setItem("dataset", JSON.stringify(data));

        setDatasetStatus({
          loaded: true,
          entries: data.length
        });

        toast.success("Dataset uploaded");
      }
    });
  };

  // 🔥 RESET
  const handleReset = () => {
    localStorage.removeItem("leaderboard");
    setLeaderboard([]);
    toast.success("Reset done");
    setShowResetConfirm(false);
  };

  // 🔥 DOWNLOAD CSV
  const handleDownload = () => {
    if (leaderboard.length === 0) return;

    const headers = Object.keys(leaderboard[0]);
    let csv = headers.join(",") + "\n";

    leaderboard.forEach((row) => {
      csv += headers.map((h) => row[h]).join(",") + "\n";
    });

    const blob = new Blob([csv]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "submissions.csv";
    a.click();
  };

  // 🔥 YOUR UI BELOW (UNCHANGED)

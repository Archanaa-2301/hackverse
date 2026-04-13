"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [team, setTeam] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // ✅ load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem("leaderboard");
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !team || !name) {
      toast.error("Please fill all fields and select a CSV file.");
      return;
    }

    setIsSubmitting(true);

    const dataset = JSON.parse(localStorage.getItem("dataset") || "[]");

    if (dataset.length === 0) {
      toast.error("Admin dataset not uploaded yet");
      setIsSubmitting(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const parsedData = results.data;

        let score = 0;

        for (let i = 0; i < parsedData.length; i++) {
          if (parsedData[i]?.prediction === dataset[i]?.answer) {
            score++;
          }
        }

        score = (score / dataset.length) * 100;

        const newEntry = {
          id: Date.now(),
          team,
          name,
          score,
          time: new Date().toLocaleTimeString(),
          rank: 0
        };

        let updated = [...leaderboard];

        const index = updated.findIndex(
          (x) => x.team.toLowerCase() === team.toLowerCase()
        );

        if (index !== -1) {
          if (score > updated[index].score) updated[index] = newEntry;
        } else {
          updated.push(newEntry);
        }

        updated.sort((a, b) => b.score - a.score);

        updated.forEach((item, i) => (item.rank = i + 1));

        setLeaderboard(updated);
        localStorage.setItem("leaderboard", JSON.stringify(updated));

        toast.success(`Score: ${score.toFixed(2)}%`);

        setFile(null);
        setTeam("");
        setName("");
        setIsSubmitting(false);
      }
    });
  };

  // 🔥 YOUR UI BELOW (UNCHANGED)

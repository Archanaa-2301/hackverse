"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [team, setTeam] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // ✅ load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("leaderboard");
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!file || !team || !name) {
      alert("Fill all fields");
      return;
    }

    const dataset = JSON.parse(localStorage.getItem("dataset") || "[]");

    if (dataset.length === 0) {
      alert("Admin dataset not uploaded");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const parsed = results.data;

        let score = 0;

        for (let i = 0; i < parsed.length; i++) {
          if (parsed[i]?.prediction === dataset[i]?.answer) {
            score++;
          }
        }

        score = (score / dataset.length) * 100;

        const newEntry = {
          team,
          name,
          score,
          time: new Date().toLocaleTimeString(),
          rank: 0
        };

        let updated = [...leaderboard];

        let index = updated.findIndex(
          (x) => x.team.toLowerCase() === team.toLowerCase()
        );

        if (index !== -1) {
          if (score > updated[index].score) updated[index] = newEntry;
        } else {
          updated.push(newEntry);
        }

        updated.sort((a, b) => b.score - a.score);

        updated.forEach((x, i) => (x.rank = i + 1));

        setLeaderboard(updated);
        localStorage.setItem("leaderboard", JSON.stringify(updated));

        alert("Score: " + score.toFixed(2));
      }
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Submission Page</h1>

      <input placeholder="Team" value={team} onChange={(e)=>setTeam(e.target.value)} />
      <br /><br />

      <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
      <br /><br />

      <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
      <br /><br />

      <button onClick={handleSubmit}>Submit</button>

      <h2>Leaderboard</h2>

      {leaderboard.map((x, i) => (
        <div key={i}>
          {x.rank}. {x.team} - {x.score.toFixed(2)}%
        </div>
      ))}
    </div>
  );
}

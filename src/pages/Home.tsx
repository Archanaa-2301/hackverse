import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [team, setTeam] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // LOAD LEADERBOARD
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    setLeaderboard(data);
  }, []);

  // 🔐 ADMIN CSV UPLOAD (FIXED)
  const handleAdminUpload = (e: any) => {
    const file = e.target.files?.[0];

    if (!file) {
      alert("No file selected ❌");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      alert("Upload CSV only ❌");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event: any) => {
      try {
        const text = event.target.result;

        const rows = text
          .split("\n")
          .filter((r: string) => r.trim() !== "")
          .map((r: string) =>
            r.split(",").map((c) => c.trim().toLowerCase())
          );

        if (rows.length === 0) {
          alert("Invalid CSV ❌");
          return;
        }

        localStorage.setItem("correctDataset", JSON.stringify(rows));

        console.log("ADMIN DATA:", rows);

        alert("✅ Admin dataset uploaded!");
      } catch (err) {
        alert("Error reading file ❌");
      }
    };

    reader.readAsText(file);
  };

  // 🧠 SUBMIT + SCORING
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !team || !name) {
      alert("Fill all fields ❌");
      return;
    }

    const correctData = JSON.parse(localStorage.getItem("correctDataset") || "[]");

    if (correctData.length === 0) {
      alert("Admin dataset missing ❌");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event: any) => {
      const text = event.target.result;

      const studentData = text
        .split("\n")
        .filter((r: string) => r.trim() !== "")
        .map((r: string) =>
          r.split(",").map((c) => c.trim().toLowerCase())
        );

      let correct = 0;
      let total = Math.min(studentData.length, correctData.length);

      for (let i = 0; i < total; i++) {
        if (JSON.stringify(studentData[i]) === JSON.stringify(correctData[i])) {
          correct++;
        }
      }

      const score = (correct / total) * 100;

      let data = JSON.parse(localStorage.getItem("leaderboard") || "[]");

      const newEntry = {
        id: Date.now(),
        team: team.toLowerCase(),
        name,
        score,
        time: new Date().toLocaleString(),
        rawTime: Date.now()
      };

      const existingIndex = data.findIndex((d: any) => d.team === newEntry.team);

      if (existingIndex !== -1) {
        if (score > data[existingIndex].score) {
          data[existingIndex] = newEntry;
        }
      } else {
        data.push(newEntry);
      }

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

      alert(`Score: ${score.toFixed(2)}%`);

      setFile(null);
      setTeam("");
      setName("");
    };

    reader.readAsText(file);
  };

  // 📊 DOWNLOAD EXCEL
  const downloadExcel = () => {
    const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    if (data.length === 0) {
      alert("No data ❌");
      return;
    }

    // ALL SUBMISSIONS
    const allSubmissions = data.map((d: any) => ({
      Team: d.team,
      Name: d.name,
      Score: d.score.toFixed(2),
      Time: d.time
    }));

    // BEST PER TEAM
    const teamMap: any = {};

    data.forEach((d: any) => {
      const key = d.team.toLowerCase();
      if (!teamMap[key] || d.score > teamMap[key].score) {
        teamMap[key] = d;
      }
    });

    let leaderboard = Object.values(teamMap);

    leaderboard.sort((a: any, b: any) => {
      if (b.score === a.score) return a.rawTime - b.rawTime;
      return b.score - a.score;
    });

    leaderboard = leaderboard.slice(0, 15);

    leaderboard = leaderboard.map((d: any, i: number) => ({
      Rank: i + 1,
      Team: d.team,
      Name: d.name,
      Score: d.score.toFixed(2),
      Time: d.time
    }));

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(allSubmissions);
    const ws2 = XLSX.utils.json_to_sheet(leaderboard);

    XLSX.utils.book_append_sheet(wb, ws1, "All_Submissions");
    XLSX.utils.book_append_sheet(wb, ws2, "Leaderboard");

    XLSX.writeFile(wb, "hackathon_results.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Hackathon System</h1>

      {/* ADMIN */}
      <h2>Admin Upload</h2>
      <input type="file" accept=".csv" onChange={handleAdminUpload} />

      {/* STUDENT */}
      <h2>Submit</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Team Name"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit">Submit</button>
      </form>

      {/* DOWNLOAD */}
      <button onClick={downloadExcel}>Download Excel</button>

      {/* LEADERBOARD */}
      <h2>Leaderboard</h2>
      {leaderboard.map((d) => (
        <div key={d.id}>
          {d.rank}. {d.team} - {d.name} - {d.score.toFixed(2)}%
        </div>
      ))}
    </div>
  );
}

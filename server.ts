import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import Papa from "papaparse";
import { Submission } from "./src/types";
import { v4 as uuidv4 } from "uuid";
import fs from "fs-extra";
import * as XLSX from "xlsx";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Persistence paths
  const DATA_FILE = path.join(process.cwd(), "data.json");
  const DATASET_FILE = path.join(process.cwd(), "dataset.json");
  const EXCEL_FILE = path.join(process.cwd(), "submissions.xlsx");

  // In-memory storage with persistence loading
  let submissions: Submission[] = [];
  let realDataset: any[] | null = null;

  try {
    if (await fs.pathExists(DATA_FILE)) {
      const data = await fs.readJson(DATA_FILE);
      if (Array.isArray(data)) {
        submissions = data;
      }
    }
    if (await fs.pathExists(DATASET_FILE)) {
      realDataset = await fs.readJson(DATASET_FILE);
    }
    console.log(`Loaded ${submissions.length} submissions and dataset status: ${realDataset ? 'Ready' : 'Not Uploaded'}`);
  } catch (err) {
    console.error("Error loading persisted data:", err);
  }

  const updateExcel = async (allSubmissions: Submission[]) => {
    try {
      const wb = XLSX.utils.book_new();
      const allData = allSubmissions.map(s => ({
        Team: s.team.toLowerCase(),
        Name: s.name,
        Score: s.score,
        Time: s.time,
        RawTime: s.rawTime
      }));
      const wsAll = XLSX.utils.json_to_sheet(allData);
      XLSX.utils.book_append_sheet(wb, wsAll, "All_Submissions");

      const bestSubmissionsMap = new Map<string, Submission>();
      allSubmissions.forEach(s => {
        const teamKey = s.team.toLowerCase();
        const existing = bestSubmissionsMap.get(teamKey);
        if (!existing || s.score > existing.score || (s.score === existing.score && s.rawTime < existing.rawTime)) {
          bestSubmissionsMap.set(teamKey, s);
        }
      });

      const leaderboardData = Array.from(bestSubmissionsMap.values())
        .sort((a, b) => b.score !== a.score ? b.score - a.score : a.rawTime - b.rawTime)
        .slice(0, 15)
        .map((s, index) => ({
          Rank: index + 1,
          Team: s.team.toLowerCase(),
          Name: s.name,
          Score: s.score,
          Time: s.time,
          RawTime: s.rawTime
        }));

      const wsLeaderboard = XLSX.utils.json_to_sheet(leaderboardData);
      XLSX.utils.book_append_sheet(wb, wsLeaderboard, "Leaderboard");
      XLSX.writeFile(wb, EXCEL_FILE);
    } catch (err) {
      console.error("Error updating persistence files:", err);
    }
  };

  const saveSubmissions = async () => {
    try {
      await fs.writeJson(DATA_FILE, submissions);
      await updateExcel(submissions);
    } catch (err) {
      console.error("Error saving submissions:", err);
    }
  };

  const saveDataset = async () => {
    try {
      await fs.writeJson(DATASET_FILE, realDataset);
    } catch (err) {
      console.error("Error saving dataset:", err);
    }
  };

  const upload = multer({ storage: multer.memoryStorage() });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      datasetLoaded: !!realDataset,
      datasetEntries: realDataset ? realDataset.length : 0
    });
  });

  app.get("/api/leaderboard", (req, res) => {
    try {
      // Group by team and take the best score
      const bestSubmissionsMap = new Map<string, Submission>();
      
      submissions.forEach(s => {
        const teamKey = (s.team || (s as any).teamName || "").toLowerCase();
        if (!teamKey) return;

        const existing = bestSubmissionsMap.get(teamKey);
        if (!existing) {
          bestSubmissionsMap.set(teamKey, s);
        } else {
          if (s.score > existing.score) {
            bestSubmissionsMap.set(teamKey, s);
          } else if (s.score === existing.score) {
            if (s.rawTime < existing.rawTime) {
              bestSubmissionsMap.set(teamKey, s);
            }
          }
        }
      });

      const bestSubmissions = Array.from(bestSubmissionsMap.values());

      const sorted = bestSubmissions.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.rawTime - b.rawTime;
      });

      // Limit to top 15 for the website as requested
      const leaderboard = sorted.slice(0, 15).map((s, index) => ({
        ...s,
        rank: index + 1,
      }));

      res.json(leaderboard);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/submit", upload.single("file"), async (req, res) => {
    try {
      const { team, name } = req.body;
      const file = req.file;

      if (!team || !name || !file) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!realDataset) {
        return res.status(400).json({ error: "Evaluation system is not ready. Real dataset not uploaded by admin." });
      }

      const fileName = file.originalname;
      if (!fileName.toLowerCase().endsWith(".csv")) {
        return res.status(400).json({ error: "Unsupported file type. Please submit a .csv file." });
      }

      const csvContent = file.buffer.toString("utf8");
      const parsedOutput = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
      const userEntries = parsedOutput.data as any[];

      let correctCount = 0;
      const totalToCompare = realDataset.length;

      realDataset.forEach((correctRow, index) => {
        const userRow = userEntries[index];
        if (userRow) {
          // Case-insensitive comparison logic
          const isMatch = Object.keys(correctRow).every(key => {
            const val1 = String(correctRow[key] || "").toLowerCase().trim();
            const val2 = String(userRow[key] || "").toLowerCase().trim();
            return val1 === val2;
          });
          
          if (isMatch) {
            correctCount++;
          }
        }
      });

      const score = totalToCompare > 0 ? (correctCount / totalToCompare) * 100 : 0;
      const finalScore = parseFloat(score.toFixed(2));

      const submission: Submission = {
        team: team.toLowerCase(), // Store team name in lowercase internally
        name: name,
        score: finalScore,
        time: new Date().toLocaleString(),
        rawTime: Date.now(),
      };

      submissions.push(submission);
      await saveSubmissions();
      res.json({ success: true, submission });
    } catch (error: any) {
      console.error("Submission error:", error);
      res.status(500).json({ error: `Failed to process submission: ${error.message}` });
    }
  });

  app.post("/api/admin/upload-correct", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const csvString = file.buffer.toString("utf8");
      const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
      realDataset = parsed.data;
      await saveDataset();
      res.json({ success: true, message: "Real dataset uploaded successfully", entries: realDataset.length });
    } catch (error) {
      console.error("Admin upload error:", error);
      res.status(500).json({ error: "Failed to parse dataset CSV" });
    }
  });

  app.get("/api/admin/submissions", (req, res) => {
    try {
      const sorted = [...submissions].sort((a, b) => b.rawTime - a.rawTime);
      res.json(sorted);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  app.get("/api/admin/download-excel", (req, res) => {
    if (fs.existsSync(EXCEL_FILE)) {
      res.download(EXCEL_FILE);
    } else {
      res.status(404).json({ error: "Excel file not found" });
    }
  });

  app.post("/api/admin/reset", async (req, res) => {
    try {
      submissions = [];
      await saveSubmissions();
      if (await fs.pathExists(EXCEL_FILE)) {
        await fs.remove(EXCEL_FILE);
      }
      res.json({ success: true, message: "Leaderboard reset" });
    } catch (err) {
      console.error("Reset error:", err);
      res.status(500).json({ error: "Failed to reset leaderboard" });
    }
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global error handler:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Fatal server error:", err);
});

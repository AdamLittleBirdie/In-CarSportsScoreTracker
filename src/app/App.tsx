import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Trophy,
  Zap,
  Activity,
  Globe,
  Radio,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Car,
  Settings,
  BarChart2,
  Home,
  X,
  RefreshCw,
  User,
  Bell,
  LogOut,
  CreditCard,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "splash" | "home" | "sports" | "stats" | "settings" | "carplay";

interface Player {
  name: string;
  team: string;
  stats: Record<string, string>;
}

interface Match {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  time: string;
  status: "live" | "upcoming" | "finished";
  startTime?: Date; // For upcoming matches
  stats: { label: string; home: string; away: string }[];
  topPlayers: Player[];
  scoreProgression?: {
    periods: string[];
    homeScores: number[];
    awayScores: number[];
    overs?: number[]; // Cricket: overs at each data point
    wickets?: number[]; // Cricket: wickets at each data point
  };
  recentScoring?: {
    type: "football" | "cricket";
    footballEvents?: Array<{
      time: string;
      team: string;
      player: string;
      scoreType: string; // "Goal", "Try", "Conversion", etc.
    }>;
    cricketBalls?: Array<{
      outcome: string; // "1", "4", "6", "W", "•" (dot ball), etc.
      bowler?: string;
      batter?: string;
    }>;
  };
  cricketInnings?: {
    currentInnings: number; // 1 or 2
    battingTeam: string;
    bowler: string;
    batters: string[];
  };
}

// ─── Team Colors ─────────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string[]> = {
  // ── AFL ──
  "Adelaide Crows":       ["#002B5C", "#E21B22", "#FFD200"],
  "Brisbane Lions":       ["#A30046", "#003087", "#FFD100"],
  "Carlton":              ["#002B5C", "#FFFFFF"],
  "Collingwood":          ["#000000", "#FFFFFF"],
  "Essendon":             ["#CC0000", "#000000"],
  "Fremantle":            ["#2C1B5E", "#FFFFFF"],
  "Geelong":              ["#1C3F94", "#FFFFFF"],
  "Gold Coast Suns":      ["#E8192C", "#FFD200"],
  "GWS Giants":           ["#F47920", "#4B4B4B", "#FFFFFF"],
  "Hawthorn":             ["#4D2004", "#FFD200"],
  "Melbourne":            ["#CC0000", "#003087"],
  "North Melbourne":      ["#003487", "#FFFFFF", "#CC0000"],
  "Port Adelaide":        ["#008AAB", "#000000", "#FFFFFF"],
  "Richmond":             ["#FFD200", "#000000"],
  "St Kilda":             ["#CC0000", "#000000", "#FFFFFF"],
  "Sydney Swans":         ["#CC0000", "#FFFFFF"],
  "West Coast Eagles":    ["#003087", "#FFD200"],
  "Western Bulldogs":     ["#003087", "#CC0000", "#FFFFFF"],
  // ── NRL ──
  "Brisbane Broncos":     ["#8B0036", "#FFD100"],
  "Canberra Raiders":     ["#74B235", "#000000"],
  "Canterbury Bulldogs":  ["#003087", "#FFFFFF"],
  "Cronulla Sharks":      ["#00A8E0", "#000000"],
  "Dolphins":             ["#CC0000", "#003087"],
  "Gold Coast Titans":    ["#009FDF", "#CC0000", "#FFD200"],
  "Manly Sea Eagles":     ["#6B1F7A", "#CC0000", "#FFFFFF"],
  "Melbourne Storm":      ["#5B2D8E", "#E8192C", "#FFFFFF"],
  "Newcastle Knights":    ["#003087", "#CC0000"],
  "New Zealand Warriors": ["#003087", "#000000", "#FFFFFF"],
  "North Queensland Cowboys": ["#003087", "#FFD200"],
  "Parramatta Eels":      ["#003087", "#FFD200"],
  "Penrith Panthers":     ["#000000", "#FFFFFF"],
  "South Sydney Rabbitohs": ["#CC0000", "#006633"],
  "St George Illawarra Dragons": ["#CC0000", "#FFFFFF"],
  "Sydney Roosters":      ["#CC0000", "#003087", "#FFFFFF"],
  "Wests Tigers":         ["#FF6B00", "#000000"],
  "NSW Blues":            ["#005BAC", "#FFFFFF"],
  "QLD Maroons":          ["#6B1C3D", "#FFD100"],
  // ── Cricket – International Test ──
  "Afghanistan":          ["#0066CC", "#CC0000", "#009933"],
  "Australia":            ["#FFD700", "#006400"],
  "Bangladesh":           ["#006A4E", "#F42A41"],
  "England":              ["#003087", "#CC0000"],
  "India":                ["#FF9933", "#FFFFFF", "#138808"],
  "Ireland":              ["#169B62", "#FFFFFF", "#FF883E"],
  "New Zealand":          ["#000000", "#FFFFFF"],
  "Pakistan":             ["#01411C", "#FFFFFF"],
  "South Africa":         ["#007A4D", "#FFB81C", "#000000"],
  "Sri Lanka":            ["#003087", "#FFD200", "#8B0000"],
  "West Indies":          ["#7B0D1E", "#FFD200"],
  "Zimbabwe":             ["#006400", "#FFD200", "#CC0000"],
  // ── BBL ──
  "Adelaide Strikers":    ["#003087", "#E21B22"],
  "Brisbane Heat":        ["#FF6B00", "#000000"],
  "Hobart Hurricanes":    ["#7B2D8B", "#FFD200"],
  "Melbourne Renegades":  ["#CC0000", "#000000"],
  "Melbourne Stars":      ["#00A550", "#FFD700"],
  "Perth Scorchers":      ["#FF6B00", "#000000"],
  "Sydney Sixers":        ["#E6007E", "#FFFFFF"],
  "Sydney Thunder":       ["#FFD700", "#000000"],
  // ── IPL ──
  "Chennai Super Kings":  ["#FFD700", "#005C9E"],
  "Delhi Capitals":       ["#003087", "#CC0000"],
  "Gujarat Titans":       ["#1D2951", "#80C6E8"],
  "Kolkata Knight Riders":["#3A225D", "#FFD700"],
  "Lucknow Super Giants": ["#A0C4D8", "#003087"],
  "Mumbai Indians":       ["#004BA0", "#D4AF37"],
  "Punjab Kings":         ["#CC0000", "#D4AF37"],
  "Rajasthan Royals":     ["#E8007A", "#003087"],
  "Royal Challengers Bengaluru": ["#CC0000", "#000000", "#D4AF37"],
  "Sunrisers Hyderabad":  ["#FF6B00", "#000000"],
  // ── Premier League ──
  "Arsenal":              ["#DB0007", "#FFFFFF"],
  "Aston Villa":          ["#95BFE5", "#670E36"],
  "Bournemouth":          ["#CC0000", "#000000"],
  "Brentford":            ["#CC0000", "#FFFFFF", "#000000"],
  "Brighton":             ["#003087", "#FFFFFF"],
  "Chelsea":              ["#034694", "#FFFFFF"],
  "Crystal Palace":       ["#003087", "#CC0000"],
  "Everton":              ["#003087", "#FFFFFF"],
  "Fulham":               ["#000000", "#FFFFFF"],
  "Ipswich Town":         ["#003087", "#FFFFFF"],
  "Leicester City":       ["#003087", "#FFD200"],
  "Liverpool":            ["#CC0000", "#F6EB61"],
  "Man City":             ["#6CABDD", "#FFFFFF"],
  "Man United":           ["#CC0000", "#FFD200", "#000000"],
  "Newcastle":            ["#000000", "#FFFFFF"],
  "Nottingham Forest":    ["#CC0000", "#FFFFFF"],
  "Southampton":          ["#CC0000", "#FFFFFF", "#000000"],
  "Tottenham":            ["#FFFFFF", "#132257"],
  "West Ham":             ["#7A263A", "#1BB1E7", "#FFFFFF"],
  "Wolves":               ["#FDB913", "#000000"],
  // ── La Liga ──
  "Alaves":               ["#003087", "#FFFFFF"],
  "Athletic Club":        ["#CC0000", "#FFFFFF"],
  "Atletico Madrid":      ["#CE3524", "#FFFFFF"],
  "Barcelona":            ["#A50044", "#004D98"],
  "Betis":                ["#1D6428", "#FFFFFF", "#FFD200"],
  "Celta Vigo":           ["#8DB3E2", "#003087"],
  "Espanol":              ["#003087", "#FFFFFF"],
  "Getafe":               ["#003087", "#FFFFFF"],
  "Girona":               ["#CC0000", "#FFFFFF"],
  "Las Palmas":           ["#FFD200", "#003087"],
  "Leganes":              ["#003087", "#FFFFFF"],
  "Mallorca":             ["#CC0000", "#000000", "#FFD200"],
  "Osasuna":              ["#CC0000", "#003087"],
  "Rayo Vallecano":       ["#FFFFFF", "#CC0000"],
  "Real Madrid":          ["#FFFFFF", "#D4AF37"],
  "Real Sociedad":        ["#003087", "#FFFFFF"],
  "Sevilla":              ["#CC0000", "#FFFFFF"],
  "Valencia":             ["#FFFFFF", "#000000"],
  "Valladolid":           ["#5A0032", "#FFFFFF"],
  "Villarreal":           ["#FFD200", "#003087"],
  // ── UEFA Champions League ──
  "Atalanta":             ["#003087", "#000000"],
  "Bayern Munich":        ["#DC052D", "#FFFFFF"],
  "Benfica":              ["#CC0000", "#FFFFFF"],
  "Borussia Dortmund":    ["#FFD200", "#000000"],
  "Brest":                ["#CC0000", "#FFFFFF"],
  "Celtic":               ["#169B62", "#FFFFFF"],
  "Club Brugge":          ["#003087", "#000000"],
  "Feyenoord":            ["#CC0000", "#FFFFFF"],
  "Inter Milan":          ["#003087", "#000000"],
  "Juventus":             ["#000000", "#FFFFFF"],
  "Leverkusen":           ["#CC0000", "#000000"],
  "Milan":                ["#CC0000", "#000000"],
  "Monaco":               ["#CC0000", "#FFFFFF"],
  "PSG":                  ["#003087", "#CC0000", "#FFD200"],
  "Porto":                ["#003087", "#FFFFFF"],
  "RB Leipzig":           ["#CC0000", "#003087", "#FFFFFF"],
  "Red Star Belgrade":    ["#CC0000", "#FFFFFF"],
  "Salzburg":             ["#CC0000", "#FFFFFF"],
  "Shakhtar Donetsk":     ["#FF6B00", "#000000"],
  "Slavia Praha":         ["#CC0000", "#FFFFFF"],
  "Sporting CP":          ["#169B62", "#FFD200"],
  "Stuttgart":            ["#CC0000", "#FFFFFF"],
  "Sturm Graz":           ["#000000", "#FFFFFF"],
  "Young Boys":           ["#FFD200", "#000000"],
};

function TeamSwatch({ team, size = 20 }: { team: string; size?: number }) {
  const colors = TEAM_COLORS[team];
  if (!colors || colors.length === 0) return null;
  const w = Math.round(size * 1.6);
  const h = size;
  const sliceW = w / colors.length;
  return (
    <span
      className="inline-flex rounded-sm overflow-hidden flex-shrink-0 border border-white/10"
      style={{ width: w, height: h }}
      title={team}
    >
      {colors.map((c, i) => (
        <span key={i} style={{ flex: 1, backgroundColor: c }} />
      ))}
    </span>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MATCHES: Match[] = [
  {
    id: "afl1",
    sport: "AFL",
    league: "AFL Premiership",
    homeTeam: "Collingwood",
    awayTeam: "GWS Giants",
    homeScore: "87",
    awayScore: "74",
    time: "Q3 12:34",
    status: "live",
    stats: [
      { label: "Disposals", home: "142", away: "118" },
      { label: "Marks", home: "38", away: "29" },
      { label: "Tackles", home: "54", away: "61" },
    ],
    scoreProgression: {
      periods: ["Q1", "Q2", "Q3", "Q4"],
      homeScores: [0, 24, 28, 52, 68, 87],
      awayScores: [0, 18, 32, 45, 61, 74],
    },
    recentScoring: {
      type: "football",
      footballEvents: [
        { time: "Q3 4:12", team: "Collingwood", player: "Jordan De Goey", scoreType: "Goal" },
        { time: "Q2 18:45", team: "GWS Giants", player: "Jesse Hogan", scoreType: "Goal" },
        { time: "Q2 14:23", team: "Collingwood", player: "Nick Daicos", scoreType: "Goal" },
      ],
    },
    topPlayers: [
      { name: "Nick Daicos",      team: "Collingwood", stats: { "Goals": "3",  "Behinds": "1", "Disposals": "38", "Marks": "8",  "Tackles": "4",  "Hit-Outs": "0",  "Clearances": "6",  "Fantasy Score": "142", "Goal Assists": "2", "Contested Possessions": "18" } },
      { name: "Jesse Hogan",      team: "GWS Giants",  stats: { "Goals": "5",  "Behinds": "2", "Disposals": "14", "Marks": "6",  "Tackles": "2",  "Hit-Outs": "0",  "Clearances": "0",  "Fantasy Score": "98",  "Goal Assists": "0", "Contested Possessions": "5"  } },
      { name: "Toby Greene",      team: "GWS Giants",  stats: { "Goals": "4",  "Behinds": "2", "Disposals": "31", "Marks": "6",  "Tackles": "5",  "Hit-Outs": "0",  "Clearances": "3",  "Fantasy Score": "128", "Goal Assists": "1", "Contested Possessions": "12" } },
      { name: "Scott Pendlebury", team: "Collingwood", stats: { "Goals": "1",  "Behinds": "0", "Disposals": "29", "Marks": "7",  "Tackles": "8",  "Hit-Outs": "0",  "Clearances": "9",  "Fantasy Score": "118", "Goal Assists": "3", "Contested Possessions": "8"  } },
      { name: "Darcy Cameron",    team: "Collingwood", stats: { "Goals": "2",  "Behinds": "1", "Disposals": "18", "Marks": "9",  "Tackles": "5",  "Hit-Outs": "32", "Clearances": "3",  "Fantasy Score": "112", "Goal Assists": "1", "Contested Possessions": "6"  } },
      { name: "Tom Mitchell",     team: "Collingwood", stats: { "Goals": "0",  "Behinds": "0", "Disposals": "23", "Marks": "4",  "Tackles": "14", "Hit-Outs": "0",  "Clearances": "8",  "Fantasy Score": "108", "Goal Assists": "0", "Contested Possessions": "9"  } },
      { name: "Josh Kelly",       team: "GWS Giants",  stats: { "Goals": "2",  "Behinds": "1", "Disposals": "27", "Marks": "5",  "Tackles": "6",  "Hit-Outs": "0",  "Clearances": "5",  "Fantasy Score": "104", "Goal Assists": "2", "Contested Possessions": "11" } },
      { name: "Jordan De Goey",   team: "Collingwood", stats: { "Goals": "3",  "Behinds": "2", "Disposals": "25", "Marks": "4",  "Tackles": "3",  "Hit-Outs": "0",  "Clearances": "2",  "Fantasy Score": "98",  "Goal Assists": "1", "Contested Possessions": "9"  } },
    ],
  },
  {
    id: "nrl1",
    sport: "NRL",
    league: "NRL Premiership",
    homeTeam: "Melbourne Storm",
    awayTeam: "Penrith Panthers",
    homeScore: "18",
    awayScore: "12",
    time: "60'",
    status: "live",
    stats: [
      { label: "Carries", home: "94", away: "81" },
      { label: "Errors", home: "3", away: "5" },
      { label: "Penalties", home: "4", away: "6" },
    ],
    scoreProgression: {
      periods: ["1st Half", "2nd Half"],
      homeScores: [0, 6, 12, 18],
      awayScores: [0, 6, 6, 12],
    },
    recentScoring: {
      type: "football",
      footballEvents: [
        { time: "58'", team: "Penrith Panthers", player: "Nathan Cleary", scoreType: "Conversion" },
        { time: "56'", team: "Penrith Panthers", player: "Brian To'o", scoreType: "Try" },
        { time: "42'", team: "Melbourne Storm", player: "Ryan Papenhuyzen", scoreType: "Try" },
      ],
    },
    topPlayers: [
      { name: "Ryan Papenhuyzen", team: "Melbourne Storm",   stats: { "Tries": "1", "Carries": "18", "Run Metres": "187", "Tackles": "12", "Line Breaks": "2", "Offloads": "3", "Errors": "0", "Penalties": "0", "Fantasy Score": "64", "Completion Rate": "100%" } },
      { name: "Nathan Cleary",    team: "Penrith Panthers",  stats: { "Tries": "1", "Carries": "15", "Run Metres": "142", "Tackles": "8",  "Line Breaks": "1", "Offloads": "1", "Errors": "1", "Penalties": "1", "Fantasy Score": "58", "Completion Rate": "89%"  } },
      { name: "Isaah Yeo",        team: "Penrith Panthers",  stats: { "Tries": "0", "Carries": "14", "Run Metres": "98",  "Tackles": "32", "Line Breaks": "0", "Offloads": "2", "Errors": "0", "Penalties": "0", "Fantasy Score": "54", "Completion Rate": "100%" } },
      { name: "Cameron Munster",  team: "Melbourne Storm",   stats: { "Tries": "0", "Carries": "12", "Run Metres": "118", "Tackles": "18", "Line Breaks": "1", "Offloads": "2", "Errors": "1", "Penalties": "0", "Fantasy Score": "52", "Completion Rate": "92%"  } },
      { name: "Jarome Luai",      team: "Penrith Panthers",  stats: { "Tries": "0", "Carries": "11", "Run Metres": "87",  "Tackles": "14", "Line Breaks": "1", "Offloads": "1", "Errors": "2", "Penalties": "1", "Fantasy Score": "44", "Completion Rate": "85%"  } },
      { name: "Harry Grant",      team: "Melbourne Storm",   stats: { "Tries": "1", "Carries": "9",  "Run Metres": "62",  "Tackles": "28", "Line Breaks": "0", "Offloads": "4", "Errors": "0", "Penalties": "1", "Fantasy Score": "48", "Completion Rate": "100%" } },
      { name: "James Fisher-Harris", team: "Penrith Panthers", stats: { "Tries": "0", "Carries": "16", "Run Metres": "134", "Tackles": "26", "Line Breaks": "0", "Offloads": "1", "Errors": "1", "Penalties": "0", "Fantasy Score": "46", "Completion Rate": "94%"  } },
    ],
  },
  {
    id: "cricket1",
    sport: "Cricket",
    league: "International Test Cricket",
    homeTeam: "Australia",
    awayTeam: "England",
    homeScore: "312/6",
    awayScore: "287",
    time: "Day 2",
    status: "live",
    stats: [
      { label: "Run Rate", home: "3.8", away: "4.2" },
      { label: "Wickets", home: "6", away: "10" },
      { label: "Overs", home: "82.3", away: "68.0" },
    ],
    scoreProgression: {
      periods: ["10 ov", "20 ov", "30 ov", "40 ov", "50 ov", "60 ov", "70 ov", "82.3 ov"],
      homeScores: [0, 0, 0, 0, 0, 0, 0, 312],
      awayScores: [0, 0, 0, 0, 0, 0, 0, 0],
      overs: [10, 20, 30, 40, 50, 60, 70, 82.3],
      wickets: [0, 2, 2, 3, 4, 5, 5, 6],
    },
    recentScoring: {
      type: "cricket",
      cricketBalls: [
        { outcome: "4", bowler: "J. Anderson", batter: "S. Smith" },
        { outcome: "1", bowler: "J. Anderson", batter: "S. Smith" },
        { outcome: "•", bowler: "J. Anderson", batter: "T. Head" },
        { outcome: "2", bowler: "J. Anderson", batter: "T. Head" },
        { outcome: "6", bowler: "M. Wood", batter: "S. Smith" },
        { outcome: "W", bowler: "M. Wood", batter: "A. Carey" },
      ],
    },
    cricketInnings: {
      currentInnings: 2,
      battingTeam: "Australia",
      bowler: "M. Wood",
      batters: ["S. Smith", "T. Head"],
    },
    topPlayers: [
      { name: "Steve Smith",         team: "Australia", stats: { "Runs": "112*", "Balls Faced": "198", "Strike Rate": "56.6", "Wickets": "0",  "Economy": "–",   "Overs Bowled": "0.0",  "Catches": "1", "Boundaries": "14", "Sixes": "2", "Fantasy Score": "142" } },
      { name: "Ben Duckett",         team: "England",   stats: { "Runs": "84",   "Balls Faced": "94",  "Strike Rate": "89.4", "Wickets": "0",  "Economy": "–",   "Overs Bowled": "0.0",  "Catches": "0", "Boundaries": "12", "Sixes": "1", "Fantasy Score": "98"  } },
      { name: "Marnus Labuschagne",  team: "Australia", stats: { "Runs": "67",   "Balls Faced": "124", "Strike Rate": "54.0", "Wickets": "0",  "Economy": "–",   "Overs Bowled": "0.0",  "Catches": "2", "Boundaries": "8",  "Sixes": "0", "Fantasy Score": "82"  } },
      { name: "Mitchell Starc",      team: "Australia", stats: { "Runs": "4",    "Balls Faced": "8",   "Strike Rate": "50.0", "Wickets": "4",  "Economy": "2.8", "Overs Bowled": "18.0", "Catches": "0", "Boundaries": "0",  "Sixes": "0", "Fantasy Score": "72"  } },
      { name: "Joe Root",            team: "England",   stats: { "Runs": "52",   "Balls Faced": "88",  "Strike Rate": "59.1", "Wickets": "2",  "Economy": "3.4", "Overs Bowled": "8.0",  "Catches": "1", "Boundaries": "6",  "Sixes": "0", "Fantasy Score": "78"  } },
      { name: "Stuart Broad",        team: "England",   stats: { "Runs": "0",    "Balls Faced": "0",   "Strike Rate": "–",    "Wickets": "3",  "Economy": "3.2", "Overs Bowled": "16.2", "Catches": "1", "Boundaries": "0",  "Sixes": "0", "Fantasy Score": "58"  } },
      { name: "Travis Head",         team: "Australia", stats: { "Runs": "31",   "Balls Faced": "42",  "Strike Rate": "73.8", "Wickets": "0",  "Economy": "–",   "Overs Bowled": "0.0",  "Catches": "0", "Boundaries": "4",  "Sixes": "1", "Fantasy Score": "44"  } },
    ],
  },
  {
    id: "football1",
    sport: "Football",
    league: "Premier League",
    homeTeam: "Man City",
    awayTeam: "Arsenal",
    homeScore: "2",
    awayScore: "1",
    time: "78'",
    status: "live",
    stats: [
      { label: "Possession", home: "58%", away: "42%" },
      { label: "Shots", home: "14", away: "9" },
      { label: "Corners", home: "7", away: "3" },
    ],
    scoreProgression: {
      periods: ["1st Half", "2nd Half"],
      homeScores: [0, 1, 2],
      awayScores: [0, 1, 1],
    },
    recentScoring: {
      type: "football",
      footballEvents: [
        { time: "72'", team: "Man City", player: "Phil Foden", scoreType: "Goal" },
        { time: "38'", team: "Arsenal", player: "Bukayo Saka", scoreType: "Goal" },
        { time: "23'", team: "Man City", player: "Kevin De Bruyne", scoreType: "Goal" },
      ],
    },
    topPlayers: [
      { name: "Kevin De Bruyne", team: "Man City", stats: { "Goals": "1", "Assists": "1", "Passes": "68", "Shots": "4", "Tackles": "1", "Interceptions": "0", "Dribbles": "3", "Key Passes": "8", "Fantasy Score": "9.1", "Distance Covered": "10.4" } },
      { name: "Phil Foden",      team: "Man City", stats: { "Goals": "1", "Assists": "0", "Passes": "54", "Shots": "5", "Tackles": "1", "Interceptions": "1", "Dribbles": "4", "Key Passes": "4", "Fantasy Score": "8.6", "Distance Covered": "10.1" } },
      { name: "Rodri",           team: "Man City", stats: { "Goals": "0", "Assists": "1", "Passes": "87", "Shots": "2", "Tackles": "4", "Interceptions": "3", "Dribbles": "1", "Key Passes": "5", "Fantasy Score": "8.2", "Distance Covered": "11.2" } },
      { name: "Martin Ødegaard", team: "Arsenal",  stats: { "Goals": "0", "Assists": "0", "Passes": "61", "Shots": "3", "Tackles": "2", "Interceptions": "2", "Dribbles": "2", "Key Passes": "6", "Fantasy Score": "7.8", "Distance Covered": "11.0" } },
      { name: "Thomas Partey",   team: "Arsenal",  stats: { "Goals": "0", "Assists": "0", "Passes": "74", "Shots": "1", "Tackles": "6", "Interceptions": "4", "Dribbles": "0", "Key Passes": "3", "Fantasy Score": "7.4", "Distance Covered": "10.8" } },
      { name: "Erling Haaland",  team: "Man City", stats: { "Goals": "0", "Assists": "0", "Passes": "22", "Shots": "6", "Tackles": "0", "Interceptions": "0", "Dribbles": "1", "Key Passes": "1", "Fantasy Score": "7.2", "Distance Covered": "8.4"  } },
      { name: "Bukayo Saka",     team: "Arsenal",  stats: { "Goals": "1", "Assists": "0", "Passes": "38", "Shots": "4", "Tackles": "3", "Interceptions": "1", "Dribbles": "5", "Key Passes": "4", "Fantasy Score": "8.4", "Distance Covered": "9.8"  } },
    ],
  },
  {
    id: "football2",
    sport: "Football",
    league: "Premier League",
    homeTeam: "Liverpool",
    awayTeam: "Chelsea",
    homeScore: "–",
    awayScore: "–",
    time: "19:45",
    status: "upcoming",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    stats: [],
    topPlayers: [],
  },
  {
    id: "afl2",
    sport: "AFL",
    league: "AFL Premiership",
    homeTeam: "Geelong Cats",
    awayTeam: "Sydney Swans",
    homeScore: "–",
    awayScore: "–",
    time: "14:20",
    status: "upcoming",
    startTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
    stats: [],
    topPlayers: [],
  },
  {
    id: "nrl2",
    sport: "NRL",
    league: "NRL Premiership",
    homeTeam: "Sydney Roosters",
    awayTeam: "South Sydney Rabbitohs",
    homeScore: "–",
    awayScore: "–",
    time: "20:05",
    status: "upcoming",
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    stats: [],
    topPlayers: [],
  },
  {
    id: "cricket2",
    sport: "Cricket",
    league: "BBL",
    homeTeam: "Melbourne Stars",
    awayTeam: "Sydney Thunder",
    homeScore: "–",
    awayScore: "–",
    time: "Tomorrow",
    status: "upcoming",
    startTime: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
    stats: [],
    topPlayers: [],
  },
];

const SPORTS_CONFIG = [
  {
    id: "afl",
    name: "AFL",
    icon: Trophy,
    leagues: ["AFL Premiership", "AFLW"],
    teams: {
      "AFL Premiership": [
        "Adelaide Crows", "Brisbane Lions", "Carlton", "Collingwood", "Essendon",
        "Fremantle", "Geelong", "Gold Coast Suns", "GWS Giants", "Hawthorn",
        "Melbourne", "North Melbourne", "Port Adelaide", "Richmond", "St Kilda",
        "Sydney Swans", "West Coast Eagles", "Western Bulldogs",
      ],
      "AFLW": [
        "Adelaide Crows", "Brisbane Lions", "Carlton", "Collingwood", "Essendon",
        "Fremantle", "Geelong", "Gold Coast Suns", "GWS Giants", "Hawthorn",
        "Melbourne", "North Melbourne", "Port Adelaide", "Richmond", "St Kilda",
        "Sydney Swans", "West Coast Eagles", "Western Bulldogs",
      ],
    },
  },
  {
    id: "nrl",
    name: "NRL",
    icon: Zap,
    leagues: ["NRL Premiership", "State of Origin"],
    teams: {
      "NRL Premiership": [
        "Brisbane Broncos", "Canberra Raiders", "Canterbury Bulldogs", "Cronulla Sharks",
        "Dolphins", "Gold Coast Titans", "Manly Sea Eagles", "Melbourne Storm",
        "Newcastle Knights", "New Zealand Warriors", "North Queensland Cowboys",
        "Parramatta Eels", "Penrith Panthers", "South Sydney Rabbitohs",
        "St George Illawarra Dragons", "Sydney Roosters", "Wests Tigers",
      ],
      "State of Origin": ["NSW Blues", "QLD Maroons"],
    },
  },
  {
    id: "cricket",
    name: "Cricket",
    icon: Activity,
    leagues: ["International Test Cricket", "BBL", "IPL"],
    teams: {
      "International Test Cricket": [
        "Afghanistan", "Australia", "Bangladesh", "England", "India",
        "Ireland", "New Zealand", "Pakistan", "South Africa", "Sri Lanka",
        "West Indies", "Zimbabwe",
      ],
      "BBL": [
        "Adelaide Strikers", "Brisbane Heat", "Hobart Hurricanes", "Melbourne Renegades",
        "Melbourne Stars", "Perth Scorchers", "Sydney Sixers", "Sydney Thunder",
      ],
      "IPL": [
        "Chennai Super Kings", "Delhi Capitals", "Gujarat Titans", "Kolkata Knight Riders",
        "Lucknow Super Giants", "Mumbai Indians", "Punjab Kings", "Rajasthan Royals",
        "Royal Challengers Bengaluru", "Sunrisers Hyderabad",
      ],
    },
  },
  {
    id: "football",
    name: "Football",
    icon: Globe,
    leagues: ["Premier League", "La Liga", "UEFA Champions League"],
    teams: {
      "Premier League": [
        "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton",
        "Chelsea", "Crystal Palace", "Everton", "Fulham", "Ipswich Town",
        "Leicester City", "Liverpool", "Man City", "Man United", "Newcastle",
        "Nottingham Forest", "Southampton", "Tottenham", "West Ham", "Wolves",
      ],
      "La Liga": [
        "Alaves", "Athletic Club", "Atletico Madrid", "Barcelona", "Betis",
        "Celta Vigo", "Espanol", "Getafe", "Girona", "Las Palmas",
        "Leganes", "Mallorca", "Osasuna", "Rayo Vallecano", "Real Madrid",
        "Real Sociedad", "Sevilla", "Valencia", "Valladolid", "Villarreal",
      ],
      "UEFA Champions League": [
        "Arsenal", "Atalanta", "Aston Villa", "Atletico Madrid", "Barcelona",
        "Bayern Munich", "Benfica", "Borussia Dortmund", "Brest", "Celtic",
        "Club Brugge", "Feyenoord", "Girona", "Inter Milan", "Juventus",
        "Leverkusen", "Liverpool", "Man City", "Milan", "Monaco",
        "PSG", "Porto", "RB Leipzig", "Real Madrid", "Red Star Belgrade",
        "Salzburg", "Shakhtar Donetsk", "Slavia Praha", "Sporting CP",
        "Stuttgart", "Sturm Graz", "Young Boys",
      ],
    },
  },
];

const STATS_OPTIONS: Record<string, string[]> = {
  AFL: ["Goals", "Behinds", "Disposals", "Marks", "Tackles", "Hit-Outs", "Clearances", "Fantasy Score", "Goal Assists", "Contested Possessions"],
  NRL: ["Tries", "Carries", "Run Metres", "Tackles", "Line Breaks", "Offloads", "Errors", "Penalties", "Fantasy Score", "Completion Rate"],
  Cricket: ["Runs", "Balls Faced", "Strike Rate", "Wickets", "Economy", "Overs Bowled", "Catches", "Boundaries", "Sixes", "Fantasy Score"],
  Football: ["Goals", "Assists", "Passes", "Shots", "Tackles", "Interceptions", "Dribbles", "Key Passes", "Fantasy Score", "Distance Covered"],
};

const DEFAULT_STATS: Record<string, string[]> = {
  AFL: ["Goals", "Disposals", "Tackles"],
  NRL: ["Tries", "Carries", "Tackles"],
  Cricket: ["Runs", "Wickets", "Economy"],
  Football: ["Goals", "Assists", "Passes"],
};

const DEFAULT_SORT: Record<string, string> = {
  AFL: "Goals",
  NRL: "Tries",
  Cricket: "Runs",
  Football: "Goals",
};

// parse any stat value to a sortable number ("112*" → 112, "89%" → 89, "3.8" → 3.8)
const parseStatNum = (v: string | undefined): number =>
  parseFloat((v ?? "0").replace(/[^0-9.]/g, "")) || 0;

// ─── Shared Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Match["status"] }) {
  if (status === "live")
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent text-accent-foreground tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
        LIVE
      </span>
    );
  if (status === "upcoming")
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-border text-muted-foreground tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
        <Clock size={10} />
        UPCOMING
      </span>
    );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-border text-muted-foreground tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
      <CheckCircle size={10} />
      FT
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-primary" : "bg-switch-background"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function BottomNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const items = [
    { id: "home" as Screen, icon: Home, label: "Home" },
    { id: "sports" as Screen, icon: Trophy, label: "Sports" },
    { id: "stats" as Screen, icon: BarChart2, label: "Stats" },
    { id: "settings" as Screen, icon: Settings, label: "Settings" },
  ];
  return (
    <nav className="flex border-t border-border bg-card flex-shrink-0">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${current === id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Icon size={20} strokeWidth={current === id ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium tracking-wide uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function MobileShell({ children, screen, onNavigate }: { children: React.ReactNode; screen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>{children}</div>
      <BottomNav current={screen} onNavigate={onNavigate} />
    </div>
  );
}

// ─── Splash Screen ────────��───────────────────────────────────────────────────

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background gap-6">
      <div className="relative flex items-center justify-center">
        <span className="absolute w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "1.5s" }} />
        <span className="absolute w-20 h-20 rounded-full border border-primary/20" />
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg" style={{ boxShadow: "0 0 32px rgba(245,166,35,0.35)" }}>
          <Car size={28} className="text-primary-foreground" strokeWidth={2} />
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-[0.15em] text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          SCORE<span className="text-primary">DRIVE</span>
        </h1>
        <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
          Live Sports · In Car
        </p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({ onNavigate, matches }: { onNavigate: (s: Screen) => void; matches: Match[] }) {
  const liveMatches = matches.filter((m) => m.status === "live");

  return (
    <MobileShell screen="home" onNavigate={onNavigate}>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            SCORE<span className="text-primary">DRIVE</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
            {liveMatches.length} matches live
          </p>
        </div>
        <button
          onClick={() => onNavigate("carplay")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded font-black text-sm tracking-wide hover:bg-primary/90 transition-colors"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          <Car size={16} strokeWidth={2} />
          DRIVE MODE
        </button>
      </div>

      {/* Live ticker */}
      <div className="mx-5 mb-5 border border-border rounded overflow-hidden">
        <div className="bg-secondary px-3 py-2 flex items-center gap-2 border-b border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-accent tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Live Now</span>
        </div>
        {liveMatches.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors cursor-pointer">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{m.sport}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <TeamSwatch team={m.homeTeam} size={14} />
                <span className="text-sm text-foreground font-medium">{m.homeTeam}</span>
                <span className="text-primary text-sm font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{m.homeScore}–{m.awayScore}</span>
                <span className="text-sm text-foreground font-medium">{m.awayTeam}</span>
                <TeamSwatch team={m.awayTeam} size={14} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>{m.time}</span>
          </div>
        ))}
      </div>

      {/* Sport tiles */}
      <div className="px-5 pb-6">
        <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Your Sports</p>
        <div className="grid grid-cols-2 gap-3">
          {SPORTS_CONFIG.map(({ id, name, icon: Icon, leagues }) => {
            const sportMatches = matches.filter((m) => m.sport === name);
            const live = sportMatches.filter((m) => m.status === "live");
            return (
              <button
                key={id}
                onClick={() => onNavigate("sports")}
                className="bg-card border border-border rounded p-4 text-left hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon size={18} className="text-primary" strokeWidth={2} />
                  </div>
                  {live.length > 0 && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                </div>
                <p className="text-base font-black text-foreground uppercase tracking-wider" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {leagues.length} leagues · {live.length > 0 ? `${live.length} live` : "No live"}
                </p>
                {sportMatches.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <TeamSwatch team={sportMatches[0].homeTeam} size={12} />
                    <span className="text-xs text-muted-foreground font-mono truncate" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {sportMatches[0].homeScore}–{sportMatches[0].awayScore}
                    </span>
                    <TeamSwatch team={sportMatches[0].awayTeam} size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}

// ─── Sports Selection Screen ──────────────────────────────────────────────────

function SportsSelectionScreen({
  onNavigate, enabledLeagues, setEnabledLeagues, selectedTeams, setSelectedTeams,
  enabledStats, setEnabledStats, sortStats, setSortStats, defaultView, setDefaultView,
}: {
  onNavigate: (s: Screen) => void;
  enabledLeagues: Record<string, boolean>;
  setEnabledLeagues: (v: Record<string, boolean>) => void;
  selectedTeams: Record<string, string[]>;
  setSelectedTeams: (v: Record<string, string[]>) => void;
  enabledStats: Record<string, string[]>;
  setEnabledStats: (v: Record<string, string[]>) => void;
  sortStats: Record<string, string>;
  setSortStats: (v: Record<string, string>) => void;
  defaultView: Record<string, "stats" | "scoring">;
  setDefaultView: (v: Record<string, "stats" | "scoring">) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [statViewOpen, setStatViewOpen] = useState<Record<string, boolean>>({});

  const toggleLeague = (league: string) =>
    setEnabledLeagues({ ...enabledLeagues, [league]: !enabledLeagues[league] });

  const toggleTeam = (league: string, team: string, allTeams: string[]) => {
    const current = selectedTeams[league] ?? allTeams;
    const next = current.includes(team) ? current.filter((t) => t !== team) : [...current, team];
    setSelectedTeams({ ...selectedTeams, [league]: next });
  };

  const toggleDisplayStat = (sport: string, stat: string) => {
    const current = enabledStats[sport] ?? DEFAULT_STATS[sport];
    if (current.includes(stat)) {
      if (current.length <= 3) return;
      setEnabledStats({ ...enabledStats, [sport]: current.filter((s) => s !== stat) });
    } else {
      if (current.length >= 5) return;
      setEnabledStats({ ...enabledStats, [sport]: [...current, stat] });
    }
  };

  return (
    <MobileShell screen="sports" onNavigate={onNavigate}>
      <div className="px-5 pt-6 pb-4 border-b border-border flex items-center gap-3">
        <Trophy size={18} className="text-primary" />
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Sports & Leagues
        </h1>
      </div>

      <div className="px-5 py-4 space-y-6">
        {SPORTS_CONFIG.map(({ name, icon: Icon, leagues, teams }) => {
          const activeSortStat = sortStats[name] ?? DEFAULT_SORT[name];
          const activeDisplayStats = enabledStats[name] ?? DEFAULT_STATS[name];
          const svOpen = statViewOpen[name] ?? false;

          return (
            <div key={name}>
              {/* Sport header */}
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className="text-primary" />
                <h2 className="text-xs font-black tracking-[0.2em] text-muted-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {name}
                </h2>
              </div>

              <div className="space-y-1">
                {/* League rows */}
                {leagues.map((league) => {
                  const isOn = enabledLeagues[league] !== false;
                  const isExpanded = expanded[league];
                  const leagueTeams = (teams as Record<string, string[]>)[league] || [];
                  const activeTeams = selectedTeams[league] ?? leagueTeams;
                  return (
                    <div key={league} className="border border-border rounded overflow-hidden">
                      <div className="flex items-center px-3 py-3 bg-card gap-3">
                        <Toggle checked={isOn} onChange={() => toggleLeague(league)} />
                        <span className="flex-1 text-sm font-medium text-foreground">{league}</span>
                        {isOn && (
                          <span className="text-xs text-muted-foreground mr-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                            {activeTeams.length}/{leagueTeams.length}
                          </span>
                        )}
                        {isOn && (
                          <button
                            onClick={() => setExpanded((e) => ({ ...e, [league]: !e[league] }))}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </div>
                      {isOn && isExpanded && (
                        <div className="border-t border-border bg-secondary/40 divide-y divide-border">
                          {leagueTeams.map((team) => (
                            <div key={team} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/60 transition-colors">
                              <TeamSwatch team={team} size={14} />
                              <span className="flex-1 text-sm text-foreground">{team}</span>
                              <Toggle
                                checked={activeTeams.includes(team)}
                                onChange={() => toggleTeam(league, team, leagueTeams)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ── Stat Views accordion ── */}
                <div className="border border-primary/30 rounded overflow-hidden">
                  <button
                    onClick={() => setStatViewOpen((s) => ({ ...s, [name]: !s[name] }))}
                    className="w-full flex items-center px-3 py-3 bg-card gap-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-5 h-5 rounded bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <SlidersHorizontal size={11} className="text-primary" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground text-left">Stat Views</span>
                    <span className="text-xs text-primary mr-2 truncate max-w-[120px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                      Sort: {activeSortStat}
                    </span>
                    <span className="text-xs text-muted-foreground mr-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {activeDisplayStats.length}/5
                    </span>
                    {svOpen ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
                  </button>

                  {svOpen && (
                    <div className="border-t border-primary/20 bg-secondary/30">
                      {/* Sort by */}
                      <div className="px-3 pt-3 pb-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          Sort players by
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {STATS_OPTIONS[name].map((stat) => (
                            <button
                              key={stat}
                              onClick={() => setSortStats({ ...sortStats, [name]: stat })}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${activeSortStat === stat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
                              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                            >
                              {stat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mx-3 border-t border-border" />

                      {/* Displayed stats */}
                      <div className="px-3 pt-2 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                            Displayed stats
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono" style={{ fontFamily: "'DM Mono', monospace" }}>
                            {activeDisplayStats.length}/5 · min 3
                          </span>
                        </div>
                        <div className="space-y-1">
                          {STATS_OPTIONS[name].map((stat) => {
                            const on = activeDisplayStats.includes(stat);
                            const atMin = on && activeDisplayStats.length <= 3;
                            const atMax = !on && activeDisplayStats.length >= 5;
                            return (
                              <div
                                key={stat}
                                className={`flex items-center justify-between bg-card border border-border rounded px-3 py-2 ${atMin ? "opacity-50" : ""}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-foreground">{stat}</span>
                                  {atMin && <span className="text-[9px] text-muted-foreground font-mono">(min)</span>}
                                  {atMax && <span className="text-[9px] text-muted-foreground font-mono">(max)</span>}
                                </div>
                                <Toggle checked={on} onChange={() => toggleDisplayStat(name, stat)} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mx-3 border-t border-border" />

                      {/* Default View */}
                      <div className="px-3 pt-2 pb-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          Default drive view
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDefaultView({ ...defaultView, [name]: "stats" })}
                            className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${(defaultView[name] ?? "stats") === "stats" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                          >
                            Stats Table
                          </button>
                          <button
                            onClick={() => setDefaultView({ ...defaultView, [name]: "scoring" })}
                            className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${(defaultView[name] ?? "stats") === "scoring" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                          >
                            Scoring
                          </button>
                        </div>
                      </div>

                      {/* Drive mode preview — top 3 players */}
                      {(() => {
                        const pm = MATCHES.find((m) => m.sport === name && m.status === "live");
                        if (!pm || pm.topPlayers.length === 0) return null;
                        const preview = [...pm.topPlayers]
                          .sort((a, b) => parseStatNum(b.stats[activeSortStat]) - parseStatNum(a.stats[activeSortStat]))
                          .slice(0, activeDisplayStats.length);
                        return (
                          <div className="mx-3 mb-3 border border-border rounded bg-[#030507] overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                              <span className="text-[9px] text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Drive preview</span>
                              <span className="text-[9px] text-primary font-mono" style={{ fontFamily: "'DM Mono', monospace" }}>{activeSortStat}</span>
                            </div>
                            {preview.map((p, i) => (
                              <div key={p.name} className="px-3 py-1.5 border-b border-border last:border-b-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] w-3 text-center flex-shrink-0" style={{ fontFamily: "'DM Mono', monospace", color: i === 0 ? "#00e57a" : "#5a6578" }}>{i + 1}</span>
                                  <TeamSwatch team={p.team} size={10} />
                                  <span className="flex-1 text-[11px] font-black uppercase truncate" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: i === 0 ? "#00e57a" : "#f0f2f5" }}>{p.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-2 pl-5">
                                  {activeDisplayStats.map((stat) => (
                                    <span key={stat} className="text-[9px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                                      <span className="text-muted-foreground">{stat} </span>
                                      <span style={{ color: stat === activeSortStat ? "#00e57a" : "#a0aab8" }}>{p.stats[stat] ?? "–"}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 pb-6 pt-2">
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate("home")}
            className="flex-1 bg-secondary text-foreground border border-border py-3 rounded font-black tracking-wider text-sm uppercase hover:bg-secondary/80 transition-colors"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Back to Home
          </button>
          <button
            onClick={() => onNavigate("home")}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded font-black tracking-wider text-sm uppercase hover:bg-primary/90 transition-colors"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

// ─── Stats Config Screen ──────────────────────────────────────────────────────

function StatsConfigScreen({
  onNavigate, enabledStats, setEnabledStats, sortStats, setSortStats,
}: {
  onNavigate: (s: Screen) => void;
  enabledStats: Record<string, string[]>;
  setEnabledStats: (v: Record<string, string[]>) => void;
  sortStats: Record<string, string>;
  setSortStats: (v: Record<string, string>) => void;
}) {
  const sports = Object.keys(STATS_OPTIONS);
  const [activeSport, setActiveSport] = useState("AFL");

  const activeStats = enabledStats[activeSport] ?? DEFAULT_STATS[activeSport];
  const activeSortStat = sortStats[activeSport] ?? DEFAULT_SORT[activeSport];

  const toggleStat = (stat: string) => {
    const current = activeStats;
    if (current.includes(stat)) {
      // can't go below 3
      if (current.length <= 3) return;
      setEnabledStats({ ...enabledStats, [activeSport]: current.filter((s) => s !== stat) });
    } else {
      // can't go above 5
      if (current.length >= 5) return;
      setEnabledStats({ ...enabledStats, [activeSport]: [...current, stat] });
    }
  };

  const previewMatch = MATCHES.find((m) => m.sport === activeSport);
  const previewPlayers = previewMatch
    ? [...previewMatch.topPlayers]
        .sort((a, b) => parseStatNum(b.stats[activeSortStat]) - parseStatNum(a.stats[activeSortStat]))
        .slice(0, activeStats.length)
    : [];

  return (
    <MobileShell screen="stats" onNavigate={onNavigate}>
      <div className="px-5 pt-6 pb-4 border-b border-border flex items-center gap-3">
        <SlidersHorizontal size={18} className="text-primary" />
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Stats Config</h1>
      </div>

      {/* Sport tabs */}
      <div className="flex border-b border-border">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-colors ${activeSport === sport ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {sport}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Sort order */}
        <div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Sort players by
          </p>
          <div className="bg-card border border-border rounded overflow-hidden">
            <div className="flex items-center px-3 py-2.5 gap-2 border-b border-border bg-secondary/40">
              <span className="text-xs text-accent font-mono tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>ACTIVE</span>
              <span className="flex-1 text-sm font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{activeSortStat}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-3">
              {STATS_OPTIONS[activeSport].map((stat) => (
                <button
                  key={stat}
                  onClick={() => setSortStats({ ...sortStats, [activeSport]: stat })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${activeSortStat === stat ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Displayed stats */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground tracking-widest uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Displayed stats
            </p>
            <span className="text-xs font-mono text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              {activeStats.length}/5 · min 3
            </span>
          </div>
          <div className="space-y-1">
            {STATS_OPTIONS[activeSport].map((stat) => {
              const on = activeStats.includes(stat);
              const atMin = on && activeStats.length <= 3;
              const atMax = !on && activeStats.length >= 5;
              return (
                <div
                  key={stat}
                  className={`flex items-center justify-between bg-card border rounded px-3 py-2.5 transition-colors ${atMin ? "border-border opacity-50" : "border-border"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{stat}</span>
                    {atMin && <span className="text-[10px] text-muted-foreground font-mono">(min)</span>}
                    {atMax && <span className="text-[10px] text-muted-foreground font-mono">(max 5)</span>}
                  </div>
                  <Toggle checked={on} onChange={() => toggleStat(stat)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* In-car preview */}
        {previewMatch && (
          <div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>In-Car Preview</p>
            <div className="bg-[#030507] border border-border rounded p-4">
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status="live" />
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{previewMatch.time}</span>
              </div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <TeamSwatch team={previewMatch.homeTeam} size={12} />
                  <p className="text-base font-black text-foreground uppercase leading-none mt-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{previewMatch.homeTeam}</p>
                  <p className="text-3xl font-black text-primary mt-1" style={{ fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{previewMatch.homeScore}</p>
                </div>
                <span className="text-muted-foreground text-sm mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>VS</span>
                <div className="text-right">
                  <div className="flex justify-end"><TeamSwatch team={previewMatch.awayTeam} size={12} /></div>
                  <p className="text-base font-black text-foreground uppercase leading-none mt-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{previewMatch.awayTeam}</p>
                  <p className="text-3xl font-black text-foreground/70 mt-1" style={{ fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{previewMatch.awayScore}</p>
                </div>
              </div>
              {/* Player leaderboard preview */}
              <div className="border-t border-border pt-2">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Top Performers · {activeSortStat}
                </p>
                <div className="space-y-1">
                  {previewPlayers.map((p, i) => (
                    <div key={p.name} className="mb-1.5 last:mb-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] w-3 flex-shrink-0 text-center" style={{ fontFamily: "'DM Mono', monospace", color: i === 0 ? "#00e57a" : "#5a6578" }}>{i + 1}</span>
                        <TeamSwatch team={p.team} size={10} />
                        <span className="flex-1 text-[11px] font-black uppercase truncate" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: i === 0 ? "#00e57a" : "#f0f2f5" }}>{p.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-2 pl-5">
                        {activeStats.map((stat) => (
                          <span key={stat} className="text-[9px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                            <span className="text-muted-foreground">{stat} </span>
                            <span style={{ color: stat === activeSortStat ? "#00e57a" : "#a0aab8" }}>{p.stats[stat] ?? "–"}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen({
  onNavigate, refreshInterval, setRefreshInterval,
}: {
  onNavigate: (s: Screen) => void;
  refreshInterval: number;
  setRefreshInterval: (v: number) => void;
}) {
  const intervals = [15, 30, 60];

  return (
    <MobileShell screen="settings" onNavigate={onNavigate}>
      <div className="px-5 pt-6 pb-4 border-b border-border flex items-center gap-3">
        <Settings size={18} className="text-primary" />
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Settings</h1>
      </div>

      <div className="px-5 py-5 space-y-6">
        <div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Data Refresh</p>
          <div className="bg-card border border-border rounded p-4">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw size={14} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Refresh Interval</span>
            </div>
            <div className="flex gap-2">
              {intervals.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setRefreshInterval(sec)}
                  className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${refreshInterval === sec ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Notifications</p>
          <div className="bg-card border border-border rounded divide-y divide-border">
            {[
              { icon: Bell, label: "Goal / Score Alerts", on: true },
              { icon: Radio, label: "Game Start Reminders", on: true },
              { icon: CheckCircle, label: "Final Score Summary", on: false },
            ].map(({ icon: Icon, label, on }, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
                <Toggle checked={on} onChange={() => {}} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Account</p>
          <div className="bg-card border border-border rounded divide-y divide-border">
            {[
              { icon: User, label: "Profile", sub: "james.martin@email.com", highlight: false, danger: false },
              { icon: CreditCard, label: "Go Ad-Free", sub: "Remove all ads · $4.99/mo", highlight: true, danger: false },
              { icon: LogOut, label: "Sign Out", sub: null, highlight: false, danger: true },
            ].map(({ icon: Icon, label, sub, highlight, danger }, i) => (
              <button key={i} className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon size={16} className={danger ? "text-destructive" : highlight ? "text-primary" : "text-muted-foreground"} />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${danger ? "text-destructive" : highlight ? "text-primary" : "text-foreground"}`}>{label}</p>
                    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                  </div>
                </div>
                {!danger && <ChevronRight size={16} className="text-muted-foreground" />}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
          ScoreDrive v1.0.0 · FitzRoy · SportMonks · CricAPI
        </p>
      </div>
    </MobileShell>
  );
}

// ─── Scoring View ─────────────────────────────────────────────────────────────

function ScoringView({ match, cfg }: { match: Match; cfg: any }) {
  if (!match.scoreProgression) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
          No score progression data
        </p>
      </div>
    );
  }

  // Cricket gets special treatment - show runs vs overs for current innings only
  if (match.sport === "Cricket" && match.cricketInnings) {
    const { overs, wickets } = match.scoreProgression;
    const battingTeam = match.cricketInnings.battingTeam;
    const isBattingHome = battingTeam === match.homeTeam;
    
    // Use current innings data
    const innings = match.scoreProgression;
    const runs = isBattingHome ? innings.homeScores : innings.awayScores;
    const maxRuns = Math.max(...runs);
    const yScale = maxRuns > 0 ? maxRuns * 1.15 : 100;
    
    const chartHeight = cfg.layout === "vertical" ? 240 : 160;
    const chartPadding = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartWidth = 500;
    const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
    const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    
    // Generate points for the innings
    const dataPoints = runs.map((run, i) => ({
      x: chartPadding.left + (i / (runs.length - 1)) * plotWidth,
      y: chartPadding.top + plotHeight - (run / yScale) * plotHeight,
      runs: run,
      over: overs?.[i] || 0,
      wicket: wickets?.[i] || 0,
    }));
    
    const linePath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Wicket points - show where wickets fell
    const wicketPoints = dataPoints.filter((_, i) => {
      if (i === 0) return false;
      const prevWickets = wickets?.[i - 1] || 0;
      const currWickets = wickets?.[i] || 0;
      return currWickets > prevWickets;
    });
    
    return (
      <div className="flex items-center justify-center gap-6 h-full px-4">
        {/* Left side: Worm Chart */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-accent" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {battingTeam} Innings
            </p>
          </div>
          
          <svg
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="overflow-visible"
            style={{ maxWidth: '100%', height: 'auto' }}
          >
            {/* Y-axis grid lines - Runs */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartPadding.top + plotHeight * (1 - ratio);
              const value = Math.round(yScale * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={chartPadding.left}
                    y1={y}
                    x2={chartWidth - chartPadding.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                  <text
                    x={chartPadding.left - 8}
                    y={y}
                    fill="#5a6578"
                    fontSize="9"
                    fontFamily="'DM Mono', monospace"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis labels - Overs */}
            {overs && overs.map((over, i) => {
              const x = chartPadding.left + (i / (runs.length - 1)) * plotWidth;
              return (
                <text
                  key={i}
                  x={x}
                  y={chartHeight - chartPadding.bottom + 15}
                  fill="#5a6578"
                  fontSize="8"
                  fontFamily="'DM Mono', monospace"
                  textAnchor="middle"
                >
                  {over}
                </text>
              );
            })}
            
            {/* The worm line */}
            <path
              d={linePath}
              fill="none"
              stroke="#00e57a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Regular data points */}
            {dataPoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#00e57a"
                stroke="#070a0f"
                strokeWidth="1.5"
              />
            ))}
            
            {/* Wicket markers - larger red dots */}
            {wicketPoints.map((point, i) => (
              <circle
                key={`wicket-${i}`}
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#ef4444"
                stroke="#070a0f"
                strokeWidth="2"
              />
            ))}
          </svg>
          
          {/* Legend */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-[9px] text-foreground font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Runs
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-[9px] text-muted-foreground font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Wickets
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Last 6 Balls Table */}
        {match.recentScoring && match.recentScoring.cricketBalls && (
          <div className="flex flex-col justify-center min-w-[200px] max-w-[320px]">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Last 6 Balls
            </p>
            <div className="space-y-1">
              {match.recentScoring.cricketBalls.map((ball, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] py-1.5 px-2 rounded bg-muted/30" style={{ fontFamily: "'DM Mono', monospace" }}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    ball.outcome === "W"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : ball.outcome === "6"
                      ? "bg-accent/20 text-accent border border-accent/40"
                      : ball.outcome === "4"
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : ball.outcome === "•"
                      ? "bg-muted/30 text-muted-foreground border border-border"
                      : "bg-muted/20 text-foreground border border-border"
                  }`}>
                    {ball.outcome}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground truncate text-[9px]">{ball.bowler || "Unknown"}</div>
                    <div className="text-muted-foreground truncate text-[8px]">to {ball.batter || "Unknown"}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-[8px] text-muted-foreground mb-0.5">Bowler: {match.cricketInnings.bowler}</p>
              <p className="text-[8px] text-muted-foreground">Batters: {match.cricketInnings.batters.join(", ")}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For non-Cricket sports, use the original chart
  const { periods, homeScores, awayScores } = match.scoreProgression;
  
  // Calculate max score for scaling
  const maxScore = Math.max(...homeScores, ...awayScores);
  const yScale = maxScore > 0 ? maxScore * 1.1 : 100; // Add 10% padding
  
  // Chart dimensions - responsive to mode
  const chartHeight = cfg.layout === "vertical" ? 240 : 160;
  const chartPadding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = 500;
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  
  // Generate points for both lines
  const homePoints = homeScores.map((score, i) => ({
    x: chartPadding.left + (i / (homeScores.length - 1)) * plotWidth,
    y: chartPadding.top + plotHeight - (score / yScale) * plotHeight,
    score,
  }));
  
  const awayPoints = awayScores.map((score, i) => ({
    x: chartPadding.left + (i / (awayScores.length - 1)) * plotWidth,
    y: chartPadding.top + plotHeight - (score / yScale) * plotHeight,
    score,
  }));
  
  // Create SVG path
  const createPath = (points: typeof homePoints) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };
  
  // Period markers
  const periodMarkers = periods.map((period, i) => {
    // Position markers at period boundaries
    const pointsPerPeriod = Math.floor((homeScores.length - 1) / periods.length);
    const markerIndex = (i + 1) * pointsPerPeriod;
    if (markerIndex >= homeScores.length) return null;
    
    return {
      x: chartPadding.left + (markerIndex / (homeScores.length - 1)) * plotWidth,
      label: period,
    };
  }).filter(Boolean) as { x: number; label: string }[];

  const homePath = createPath(homePoints);
  const awayPath = createPath(awayPoints);

  return (
    <div className="flex items-center justify-center gap-6 h-full px-4">
      {/* Left side: Chart and legend */}
      <div className="flex flex-col items-center justify-center flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-primary" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Score Progression
          </p>
        </div>
        
        <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="overflow-visible"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartPadding.top + plotHeight * (1 - ratio);
          const value = Math.round(yScale * ratio);
          return (
            <g key={ratio}>
              <line
                x1={chartPadding.left}
                y1={y}
                x2={chartWidth - chartPadding.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <text
                x={chartPadding.left - 8}
                y={y}
                fill="#5a6578"
                fontSize="9"
                fontFamily="'DM Mono', monospace"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {value}
              </text>
            </g>
          );
        })}
        
        {/* Period boundary lines */}
        {periodMarkers.map((marker, i) => (
          <g key={i}>
            <line
              x1={marker.x}
              y1={chartPadding.top}
              x2={marker.x}
              y2={chartHeight - chartPadding.bottom}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text
              x={marker.x}
              y={chartHeight - chartPadding.bottom + 12}
              fill="#5a6578"
              fontSize="8"
              fontFamily="'Barlow Condensed', sans-serif"
              textAnchor="middle"
              fontWeight="600"
            >
              {marker.label}
            </text>
          </g>
        ))}
        
        {/* Away team line (draw first so home is on top) */}
        <path
          d={awayPath}
          fill="none"
          stroke="rgba(240,242,245,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Away team points */}
        {awayPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="rgba(240,242,245,0.6)"
            stroke="rgba(240,242,245,0.8)"
            strokeWidth="1"
          />
        ))}
        
        {/* Home team line */}
        <path
          d={homePath}
          fill="none"
          stroke="#f5a623"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Home team points */}
        {homePoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="#f5a623"
            stroke="#070a0f"
            strokeWidth="1.5"
          />
        ))}
      </svg>
        
        {/* Legend */}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span className="text-[9px] text-foreground font-semibold truncate max-w-[100px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {match.homeTeam}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-foreground/40 rounded" />
            <span className="text-[9px] text-muted-foreground font-semibold truncate max-w-[100px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {match.awayTeam}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Recent Scoring Events */}
      {match.recentScoring && (
        <div className="flex flex-col justify-center min-w-[200px] max-w-[280px]">
          {match.recentScoring.type === "football" && match.recentScoring.footballEvents && (
            <>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Recent Scorers
              </p>
              <div className="space-y-1">
                {match.recentScoring.footballEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[10px] py-1 px-2 rounded bg-muted/30" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <span className="text-muted-foreground min-w-[35px]">{event.time}</span>
                    <span className="text-accent font-semibold">{event.scoreType}</span>
                    <span className="text-foreground truncate flex-1">{event.player}</span>
                    <span className="text-muted-foreground text-[8px] truncate max-w-[80px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {event.team}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {match.recentScoring.type === "cricket" && match.recentScoring.cricketBalls && (
            <>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Last 6 Balls
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {match.recentScoring.cricketBalls.map((ball, idx) => (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      ball.outcome === "W"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : ball.outcome === "6"
                        ? "bg-accent/20 text-accent border border-accent/40"
                        : ball.outcome === "4"
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : ball.outcome === "•"
                        ? "bg-muted/30 text-muted-foreground border border-border"
                        : "bg-muted/20 text-foreground border border-border"
                    }`}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {ball.outcome}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Carplay Screen ──���────────────────────────────────────────────────────────

type DisplayMode = "full" | "half" | "quarter";
type DriveLayout = "vertical" | "horizontal";

// Per-mode config — layout, font sizes, spacing all in one place
const DRIVE_MODE_CFG = {
  full: {
    layout:        "horizontal" as DriveLayout,
    scoreFont:     "clamp(3rem, 10vw, 5rem)",
    nameSz:        "clamp(1rem, 3vw, 1.5rem)",
    timeSz:        "1.1rem",
    swatchSz:      18,
    px:            "1.25rem",
    pt:            "0.625rem",
    scoreRatio:    1,
    statsRatio:    2,
    playerPy:      "0.45rem",
    tblHeaderSz:   "1rem",
    tblNameSz:     "1.35rem",
    tblValueSz:    "1.25rem",
    tblRankSz:     "1.1rem",
    tblSwatchSz:   18,
    tblNameMaxW:   "16rem",
    showAllStats:  true,
    maxPlayers:    6,
    navBtnSz:      36,
    navIconSz:     16,
    showNavLabel:  true,
  },
  half: {
    layout:        "horizontal" as DriveLayout,
    scoreFont:     "clamp(2rem, 7vw, 3.5rem)",
    nameSz:        "clamp(0.75rem, 2.5vw, 1.2rem)",
    timeSz:        "0.95rem",
    swatchSz:      14,
    px:            "0.75rem",
    pt:            "0.5rem",
    scoreRatio:    1,
    statsRatio:    2,
    playerPy:      "0.35rem",
    tblHeaderSz:   "0.9rem",
    tblNameSz:     "1.15rem",
    tblValueSz:    "1.1rem",
    tblRankSz:     "0.95rem",
    tblSwatchSz:   15,
    tblNameMaxW:   "11rem",
    showAllStats:  true,
    maxPlayers:    5,
    navBtnSz:      30,
    navIconSz:     14,
    showNavLabel:  false,
  },
  quarter: {
    layout:        "horizontal" as DriveLayout,
    scoreFont:     "clamp(1.5rem, 6vw, 2.5rem)",
    nameSz:        "clamp(0.6rem, 2vw, 0.9rem)",
    timeSz:        "0.75rem",
    swatchSz:      10,
    px:            "0.5rem",
    pt:            "0.375rem",
    scoreRatio:    1,
    statsRatio:    2,
    playerPy:      "0.3rem",
    tblHeaderSz:   "0.75rem",
    tblNameSz:     "0.95rem",
    tblValueSz:    "0.9rem",
    tblRankSz:     "0.8rem",
    tblSwatchSz:   12,
    tblNameMaxW:   "7rem",
    showAllStats:  true,
    maxPlayers:    4,
    navBtnSz:      24,
    navIconSz:     11,
    showNavLabel:  false,
  },
} as const;

function ModeIcon({ mode, active, onClick }: { mode: DisplayMode; active: boolean; onClick: () => void }) {
  const fill = active ? "#f5a623" : "#2a3545";
  const border = active ? "border-primary" : "border-border hover:border-foreground/30";
  return (
    <button onClick={onClick} title={mode} className={`rounded-sm border transition-colors flex-shrink-0 w-7 h-5 overflow-hidden ${border}`}>
      {mode === "full"    && <div className="w-full h-full" style={{ background: fill }} />}
      {mode === "half"    && <div className="w-full h-full flex"><div className="w-1/2 h-full" style={{ background: fill }} /><div className="w-1/2 h-full" /></div>}
      {mode === "quarter" && <div className="w-full h-full grid grid-cols-2 grid-rows-2"><div style={{ background: fill }} /><div /><div /><div /></div>}
    </button>
  );
}

function CarplayScreen({ onExit, matches, enabledStats, sortStats, defaultView }: { onExit: () => void; matches: Match[]; enabledStats: Record<string, string[]>; sortStats: Record<string, string>; defaultView: Record<string, "stats" | "scoring"> }) {
  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const allDisplayMatches = [...liveMatches, ...upcomingMatches];
  const [idx, setIdx] = useState(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("full");
  
  const match   = allDisplayMatches[idx] || allDisplayMatches[0];
  const initialView = match ? (defaultView[match.sport] ?? "stats") : "stats";
  const [viewMode, setViewMode] = useState<"stats" | "scoring">(initialView);
  
  const touchStart = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Update viewMode when match changes based on sport's default view
  useEffect(() => {
    if (match) {
      setViewMode(defaultView[match.sport] ?? "stats");
    }
  }, [match?.sport, defaultView]);

  useEffect(() => {
    if (allDisplayMatches.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % allDisplayMatches.length), 15000);
    return () => clearInterval(t);
  }, [allDisplayMatches.length]);
  const advance = useCallback(() => setIdx((i) => (i + 1) % allDisplayMatches.length), [allDisplayMatches.length]);
  const retreat = useCallback(() => setIdx((i) => (i - 1 + allDisplayMatches.length) % allDisplayMatches.length), [allDisplayMatches.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null || touchStartY.current === null) return;
    const deltaX = touchStart.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    
    // Determine if swipe is more horizontal or vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe - switch matches
      if (Math.abs(deltaX) > 50) deltaX > 0 ? advance() : retreat();
    } else {
      // Vertical swipe - switch views
      if (Math.abs(deltaY) > 50) {
        setViewMode(deltaY > 0 ? "scoring" : "stats");
      }
    }
    
    touchStart.current = null;
    touchStartY.current = null;
  };

  const sportIcons: Record<string, React.ReactNode> = {
    AFL: <Trophy size={12} strokeWidth={2} />, NRL: <Zap size={12} strokeWidth={2} />,
    Cricket: <Activity size={12} strokeWidth={2} />, Football: <Globe size={12} strokeWidth={2} />,
  };

  if (!match) return (
    <div className="flex flex-col h-full bg-[#030507] items-center justify-center gap-4">
      <p className="text-muted-foreground text-sm font-mono">No matches available</p>
      <button onClick={onExit} className="text-primary text-sm font-medium">Back to Home</button>
    </div>
  );

  const activeSortStat = sortStats[match.sport] ?? DEFAULT_SORT[match.sport];
  const displayStats   = enabledStats[match.sport] ?? DEFAULT_STATS[match.sport];

  // Helper to format time until match starts
  const getTimeUntilStart = (startTime: Date) => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Starting soon";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const UpcomingMatchPanel = ({ cfg }: { cfg: typeof DRIVE_MODE_CFG[DisplayMode] }) => {
    const [countdown, setCountdown] = useState(match.startTime ? getTimeUntilStart(match.startTime) : "");
    
    useEffect(() => {
      if (!match.startTime) return;
      const interval = setInterval(() => {
        setCountdown(getTimeUntilStart(match.startTime!));
      }, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }, [match.startTime]);
    
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6" style={{ padding: `0 ${cfg.px}` }}>
        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-border/30 border border-border">
          <Clock size={12} className="text-muted-foreground" />
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
            UPCOMING
          </span>
        </div>

        {/* League & Sport */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border">
            <div className="text-primary">{sportIcons[match.sport]}</div>
            <span className="text-xs font-black tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {match.league}
            </span>
          </div>
        </div>

        {/* Countdown */}
        {match.startTime && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Starts in
            </p>
            <p className="font-black text-accent leading-none" 
              style={{ 
                fontSize: cfg.layout === "horizontal" ? "clamp(2rem, 8vw, 4rem)" : "clamp(3rem, 10vw, 5rem)", 
                fontFamily: "'DM Mono', monospace",
                textShadow: "0 0 40px rgba(0,229,122,0.3)"
              }}>
              {countdown}
            </p>
          </div>
        )}

        {/* Teams */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          {/* Home Team */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <TeamSwatch team={match.homeTeam} size={cfg.layout === "horizontal" ? 20 : 24} />
            <span className="font-black text-foreground uppercase flex-1" 
              style={{ 
                fontSize: cfg.layout === "horizontal" ? "clamp(1rem, 3vw, 1.3rem)" : "clamp(1.2rem, 4vw, 1.5rem)", 
                fontFamily: "'Barlow Condensed', sans-serif" 
              }}>
              {match.homeTeam}
            </span>
          </div>

          {/* VS Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-border font-black" style={{ fontSize: cfg.timeSz, fontFamily: "'Barlow Condensed', sans-serif" }}>
              VS
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <TeamSwatch team={match.awayTeam} size={cfg.layout === "horizontal" ? 20 : 24} />
            <span className="font-black text-foreground uppercase flex-1" 
              style={{ 
                fontSize: cfg.layout === "horizontal" ? "clamp(1rem, 3vw, 1.3rem)" : "clamp(1.2rem, 4vw, 1.5rem)", 
                fontFamily: "'Barlow Condensed', sans-serif" 
              }}>
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Match Time */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-sm font-mono text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
            {match.time}
          </span>
        </div>
      </div>
    );
  };

  const DrivePanel = ({ cfg }: { cfg: typeof DRIVE_MODE_CFG[DisplayMode] }) => {
    const showCount = Math.min(Math.max(displayStats.length, 3), cfg.maxPlayers);
    const players   = [...match.topPlayers]
      .sort((a, b) => parseStatNum(b.stats[activeSortStat]) - parseStatNum(a.stats[activeSortStat]))
      .slice(0, showCount);

    // ── Score content, shaped by layout ──
    const ScoreContent = () => cfg.layout === "vertical" ? (
      /* VERTICAL (full): home stacked top, away stacked bottom, divider in middle */
      <div className="w-full flex flex-col justify-center gap-0" style={{ padding: `0 ${cfg.px}` }}>
        {/* Home */}
        <div className="flex items-center gap-2">
          <TeamSwatch team={match.homeTeam} size={cfg.swatchSz} />
          <span className="font-black text-foreground uppercase leading-none tracking-tight truncate"
            style={{ fontSize: cfg.nameSz, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {match.homeTeam}
          </span>
        </div>
        <p className="font-black text-primary leading-none"
          style={{ fontSize: cfg.scoreFont, fontFamily: "'DM Mono', monospace",
            textShadow: "0 0 40px rgba(245,166,35,0.3)", lineHeight: 0.9 }}>
          {match.homeScore}
        </p>
        {/* Divider + time */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-mono tracking-widest font-semibold"
            style={{ fontSize: cfg.timeSz, fontFamily: "'DM Mono', monospace", color: "#00e57a" }}>
            {match.time}
          </span>
          <span className="font-black" style={{ fontSize: cfg.timeSz, fontFamily: "'Barlow Condensed', sans-serif", color: "#ffffff" }}>
            VS
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        {/* Away */}
        <p className="font-black text-foreground/65 leading-none text-right"
          style={{ fontSize: cfg.scoreFont, fontFamily: "'DM Mono', monospace", lineHeight: 0.9 }}>
          {match.awayScore}
        </p>
        <div className="flex items-center justify-end gap-2 mt-1">
          <span className="font-black text-foreground uppercase leading-none tracking-tight truncate"
            style={{ fontSize: cfg.nameSz, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {match.awayTeam}
          </span>
          <TeamSwatch team={match.awayTeam} size={cfg.swatchSz} />
        </div>
      </div>
    ) : (
      /* HORIZONTAL (half/quarter): home left, VS centre, away right */
      <div className="w-full grid items-center" style={{ gridTemplateColumns: "1fr auto 1fr", gap: "0 0.375rem", padding: `0 ${cfg.px}` }}>
        {/* Home */}
        <div className="text-left min-w-0">
          <TeamSwatch team={match.homeTeam} size={cfg.swatchSz} />
          <p className="font-black text-foreground uppercase leading-tight tracking-tight mt-0.5 truncate"
            style={{ fontSize: cfg.nameSz, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {match.homeTeam}
          </p>
          <p className="font-black text-primary leading-none"
            style={{ fontSize: cfg.scoreFont, fontFamily: "'DM Mono', monospace",
              textShadow: "0 0 30px rgba(245,166,35,0.25)", lineHeight: 0.9 }}>
            {match.homeScore}
          </p>
        </div>
        {/* VS + time */}
        <div className="flex flex-col items-center gap-0.5 px-1">
          <span className="font-black" style={{ fontSize: cfg.nameSz, fontFamily: "'Barlow Condensed', sans-serif", color: "#ffffff" }}>VS</span>
          <span className="font-mono font-semibold" style={{ fontSize: cfg.timeSz, fontFamily: "'DM Mono', monospace", color: "#00e57a" }}>{match.time}</span>
        </div>
        {/* Away */}
        <div className="text-right min-w-0">
          <div className="flex justify-end"><TeamSwatch team={match.awayTeam} size={cfg.swatchSz} /></div>
          <p className="font-black text-foreground uppercase leading-tight tracking-tight mt-0.5 truncate"
            style={{ fontSize: cfg.nameSz, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {match.awayTeam}
          </p>
          <p className="font-black text-foreground/65 leading-none"
            style={{ fontSize: cfg.scoreFont, fontFamily: "'DM Mono', monospace", lineHeight: 0.9 }}>
            {match.awayScore}
          </p>
        </div>
      </div>
    );

    return (
      <div className="flex flex-col h-full bg-[#030507] select-none overflow-hidden"
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {/* ── Top bar ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0 border-b border-white/8"
          style={{ padding: `${cfg.pt} ${cfg.px} ${cfg.pt}` }}>
          <StatusBadge status={match.status} />
          {displayMode !== "quarter" && (
            <span className="flex items-center gap-1 text-muted-foreground border border-border rounded px-1.5 py-0.5 truncate max-w-[40%]"
              style={{ fontSize: cfg.timeSz, fontFamily: "'DM Mono', monospace" }}>
              {sportIcons[match.sport]}
              <span className="truncate">{match.league}</span>
            </span>
          )}
          <div className="flex-1" />
          <div className="flex gap-1">
            {(["full","half","quarter"] as DisplayMode[]).map((m) => (
              <ModeIcon key={m} mode={m} active={displayMode === m} onClick={() => setDisplayMode(m)} />
            ))}
          </div>
          <button onClick={onExit}
            className="ml-1.5 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            style={{ width: cfg.navBtnSz * 0.8, height: cfg.navBtnSz * 0.8 }}>
            <X size={cfg.navIconSz - 3} />
          </button>
        </div>

        {/* ── Score (33%) ── */}
        <div className="flex flex-col justify-center overflow-hidden"
          style={{ flex: cfg.scoreRatio }}>
          <ScoreContent />
        </div>

        {/* ── Stats / Scoring toggle section (66%) ── */}
        <div className="border-t border-border overflow-hidden relative"
          style={{ flex: cfg.statsRatio, minHeight: 0 }}>
          <AnimatePresence mode="wait" initial={false}>
            {viewMode === "stats" && players.length > 0 && (() => {
          const statCols = cfg.showAllStats ? displayStats : [activeSortStat];
          // Grid: rank | swatch | name (capped) | stat… | 1fr absorbs right space
          // Using auto for name + stats keeps everything left-aligned together
          const colTemplate = [
            "1.5rem",
            `${cfg.tblSwatchSz * 1.75}px`,
            `minmax(0, ${cfg.tblNameMaxW})`,
            ...statCols.map(() => "auto"),
            "1fr",
          ].join(" ");
          const rowBorder = "1px solid rgba(255,255,255,0.06)";
          const hdrBorder = "1px solid rgba(255,255,255,0.1)";
          const hdrBg     = "rgba(14,19,25,0.95)";
          const vp        = cfg.playerPy;
          const hp        = "0.5rem";

          // shared cell base styles
          const base = { display: "flex", alignItems: "center", padding: `${vp} ${hp}` } as const;

          return (
            <motion.div
              key="stats"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-hidden"
              style={{ display: "grid", gridTemplateColumns: colTemplate, gridAutoRows: "auto", alignContent: "start" }}>

              {/* ── Header row ── */}
              {/* rank */}
              <div style={{ ...base, background: hdrBg, borderBottom: hdrBorder }} />
              {/* swatch */}
              <div style={{ ...base, background: hdrBg, borderBottom: hdrBorder }} />
              {/* player label */}
              <div style={{ ...base, background: hdrBg, borderBottom: hdrBorder,
                fontSize: cfg.tblHeaderSz, fontFamily: "'Barlow Condensed', sans-serif",
                color: "#5a6578", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                paddingRight: "1rem" }}>
                Player
              </div>
              {statCols.map((stat) => (
                <div key={stat} style={{ ...base, background: hdrBg, borderBottom: hdrBorder,
                  fontSize: cfg.tblHeaderSz, fontFamily: "'Barlow Condensed', sans-serif",
                  color: stat === activeSortStat ? "#00e57a" : "#5a6578",
                  fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  whiteSpace: "nowrap", paddingRight: "1rem" }}>
                  {stat}
                </div>
              ))}
              {/* spacer */}
              <div style={{ background: hdrBg, borderBottom: hdrBorder }} />

              {/* ── Player rows ── */}
              {players.map((p, i) => (
                <React.Fragment key={p.name}>
                  {/* rank */}
                  <div style={{ ...base, borderBottom: rowBorder, justifyContent: "center",
                    fontSize: cfg.tblRankSz, fontFamily: "'DM Mono', monospace",
                    color: i === 0 ? "#00e57a" : "#5a6578", fontWeight: 500 }}>
                    {i + 1}
                  </div>
                  {/* swatch */}
                  <div style={{ ...base, borderBottom: rowBorder }}>
                    <TeamSwatch team={p.team} size={cfg.tblSwatchSz} />
                  </div>
                  {/* name */}
                  <div style={{ ...base, borderBottom: rowBorder,
                    fontSize: cfg.tblNameSz, fontFamily: "'Barlow Condensed', sans-serif",
                    color: i === 0 ? "#00e57a" : "#f0f2f5", fontWeight: 800,
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    paddingRight: "1rem" }}>
                    {p.name}
                  </div>
                  {/* stat values — left-aligned, right after name */}
                  {statCols.map((stat) => (
                    <div key={stat} style={{ ...base, borderBottom: rowBorder,
                      fontSize: cfg.tblValueSz, fontFamily: "'DM Mono', monospace",
                      color: stat === activeSortStat ? (i === 0 ? "#00e57a" : "#00a558") : "#a0aab8",
                      fontWeight: 500, whiteSpace: "nowrap", paddingRight: "1rem" }}>
                      {p.stats[stat] ?? "–"}
                    </div>
                  ))}
                  {/* right spacer */}
                  <div style={{ borderBottom: rowBorder }} />
                </React.Fragment>
              ))}
            </motion.div>
          );
        })()}
            
            {viewMode === "scoring" && (
              <motion.div
                key="scoring"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <ScoringView match={match} cfg={cfg} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Nav ── */}
        <div className="flex items-center justify-between flex-shrink-0 border-t border-border"
          style={{ padding: `0.3rem ${cfg.px}` }}>
          <button onClick={retreat} disabled={allDisplayMatches.length <= 1}
            className="rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            style={{ width: cfg.navBtnSz, height: cfg.navBtnSz }}>
            <ChevronLeft size={cfg.navIconSz} />
          </button>
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1.5">
              {allDisplayMatches.map((m, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`transition-all rounded-full ${i === idx ? (m.status === "live" ? "bg-accent" : "bg-primary") : "bg-border hover:bg-muted-foreground"}`}
                  style={{ width: i === idx ? 18 : 6, height: 6 }} />
              ))}
            </div>
            {/* View mode indicator */}
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setViewMode("stats")}
                className={`px-1.5 py-0.5 rounded text-[9px] tracking-wider transition-colors ${
                  viewMode === "stats" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                STATS
              </button>
              <div className="w-px h-2 bg-border" />
              <button
                onClick={() => setViewMode("scoring")}
                className={`px-1.5 py-0.5 rounded text-[9px] tracking-wider transition-colors ${
                  viewMode === "scoring" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                SCORING
              </button>
            </div>
            {cfg.showNavLabel && (
              <p className="text-muted-foreground tracking-widest" style={{ fontSize: "0.625rem", fontFamily: "'DM Mono', monospace" }}>
                ← → MATCH · ↕ VIEW
              </p>
            )}
          </div>
          <button onClick={advance} disabled={allDisplayMatches.length <= 1}
            className="rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            style={{ width: cfg.navBtnSz, height: cfg.navBtnSz }}>
            <ChevronRight size={cfg.navIconSz} />
          </button>
        </div>
      </div>
    );
  };

  const cfg = DRIVE_MODE_CFG[displayMode];
  const MatchPanel = match.status === "upcoming" ? UpcomingMatchPanel : DrivePanel;
  
  if (displayMode === "full") return <MatchPanel cfg={cfg} />;

  if (displayMode === "half") return (
    <div className="flex h-full bg-[#060a10]">
      <div className="w-1/2 h-full border-r border-white/8 flex-shrink-0 overflow-hidden">
        <MatchPanel cfg={cfg} />
      </div>
      <div className="w-1/2 h-full flex flex-col items-center justify-center gap-3">
        <Car size={20} className="text-white/15" />
        <p className="text-white/10 text-xs tracking-widest uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Other App</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 grid-rows-2 h-full bg-[#060a10]">
      <div className="border-r border-b border-white/8 overflow-hidden"><MatchPanel cfg={cfg} /></div>
      <div className="flex items-center justify-center border-b border-white/8">
        <p className="text-white/10 text-[9px] tracking-widest uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Other App</p>
      </div>
      <div className="flex items-center justify-center border-r border-white/8">
        <p className="text-white/10 text-[9px] tracking-widest uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Other App</p>
      </div>
      <div className="flex items-center justify-center">
        <p className="text-white/10 text-[9px] tracking-widest uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Other App</p>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [enabledLeagues, setEnabledLeagues] = useState<Record<string, boolean>>({
    "AFL Premiership": true, "AFLW": false,
    "NRL Premiership": true, "State of Origin": false,
    "International Test Cricket": true, "BBL": false, "IPL": false,
    "Premier League": true, "La Liga": false, "UEFA Champions League": true,
  });
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string[]>>({});
  const [enabledStats, setEnabledStats] = useState<Record<string, string[]>>({});
  const [sortStats, setSortStats] = useState<Record<string, string>>({ ...DEFAULT_SORT });
  const [defaultView, setDefaultView] = useState<Record<string, "stats" | "scoring">>({
    AFL: "stats",
    NRL: "stats", 
    Cricket: "stats",
    Football: "stats",
  });
  const [refreshInterval, setRefreshInterval] = useState(30);

  const navigate = useCallback((s: Screen) => setScreen(s), []);
  const visibleMatches = MATCHES.filter((m) => enabledLeagues[m.league] !== false);

  return (
    <div className="size-full bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Barlow', sans-serif" }}>
      {screen === "splash" && <SplashScreen onDone={() => navigate("home")} />}
      {screen === "home" && <HomeScreen onNavigate={navigate} matches={visibleMatches} />}
      {screen === "sports" && (
        <SportsSelectionScreen
          onNavigate={navigate}
          enabledLeagues={enabledLeagues}
          setEnabledLeagues={setEnabledLeagues}
          selectedTeams={selectedTeams}
          setSelectedTeams={setSelectedTeams}
          enabledStats={enabledStats}
          setEnabledStats={setEnabledStats}
          sortStats={sortStats}
          setSortStats={setSortStats}
          defaultView={defaultView}
          setDefaultView={setDefaultView}
        />
      )}
      {screen === "stats" && (
        <StatsConfigScreen
          onNavigate={navigate}
          enabledStats={enabledStats}
          setEnabledStats={setEnabledStats}
          sortStats={sortStats}
          setSortStats={setSortStats}
        />
      )}
      {screen === "settings" && (
        <SettingsScreen
          onNavigate={navigate}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
        />
      )}
      {screen === "carplay" && <CarplayScreen onExit={() => navigate("home")} matches={visibleMatches} enabledStats={enabledStats} sortStats={sortStats} defaultView={defaultView} />}
    </div>
  );
}

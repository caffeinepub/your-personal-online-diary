import { Toaster } from "@/components/ui/sonner";
import {
  AlignLeft,
  Bird,
  BookOpen,
  CheckSquare,
  ChevronRight,
  Clock,
  Cloud,
  DollarSign,
  Dumbbell,
  Edit2,
  FileText,
  Flower2,
  Loader2,
  Lock,
  LogOut,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type DiaryEntry,
  PageType,
  Variant_day_month_week_year,
} from "./backend.d";
import { useActor } from "./hooks/useActor";

type Theme = "girlish" | "boyish";
type AppState = "landing" | "pinlock" | "diary";
type DiaryPage =
  | "plain"
  | "normal"
  | "habit"
  | "timetracker"
  | "saved"
  | "settings";

// Pure black + real red palette for boyish
const BOY = {
  bg: "#0a0a0a",
  card: "#111111",
  sidebar: "#0d0d0d",
  border: "#2a2a2a",
  accent: "#cc0000",
  accentHover: "#e00000",
  accentText: "#ff2222",
  hover: "#1a1a1a",
  text: "#e2e2e2",
  textMuted: "#666666",
  pageWhite: "#ffffff",
  pageText: "#1a1a1a",
};

interface HabitItem {
  id: number;
  name: string;
  days: boolean[];
  startDate: string;
}

interface MilestoneItem {
  id: number;
  title: string;
  date: string;
  category: "day" | "week" | "month" | "year";
}

// ─── Floating Background Icons ────────────────────────────────────────────────
const BarbellSVG = ({ size = 48 }: { size?: number }) => (
  <svg
    role="img"
    aria-label="Barbell"
    width={size}
    height={size}
    viewBox="0 0 64 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Barbell</title>
    <rect x="0" y="8" width="10" height="8" rx="2" />
    <rect x="10" y="5" width="6" height="14" rx="2" />
    <rect x="16" y="10" width="32" height="4" rx="2" />
    <rect x="48" y="5" width="6" height="14" rx="2" />
    <rect x="54" y="8" width="10" height="8" rx="2" />
  </svg>
);

const floatingIconsGirlish = [
  { id: "g1", icon: Flower2, top: "8%", left: "5%", size: 36, delay: 0 },
  { id: "g2", icon: Bird, top: "15%", left: "88%", size: 32, delay: 1 },
  { id: "g3", icon: Cloud, top: "4%", left: "45%", size: 48, delay: 2 },
  { id: "g4", icon: Flower2, top: "35%", left: "92%", size: 28, delay: 0.5 },
  { id: "g5", icon: Bird, top: "60%", left: "3%", size: 40, delay: 1.5 },
  { id: "g6", icon: Cloud, top: "70%", left: "80%", size: 44, delay: 0.8 },
  { id: "g7", icon: Flower2, top: "80%", left: "20%", size: 32, delay: 2.2 },
  { id: "g8", icon: Bird, top: "50%", left: "60%", size: 30, delay: 1.2 },
  { id: "g9", icon: Cloud, top: "88%", left: "55%", size: 52, delay: 0.3 },
  { id: "g10", icon: Flower2, top: "25%", left: "25%", size: 24, delay: 1.8 },
  { id: "g11", icon: Bird, top: "42%", left: "75%", size: 36, delay: 0.6 },
  { id: "g12", icon: Cloud, top: "92%", left: "10%", size: 40, delay: 2.5 },
];

const floatingIconsBoyish = [
  { id: "b1", icon: DollarSign, top: "8%", left: "5%", size: 36, delay: 0 },
  { id: "b2", icon: Dumbbell, top: "15%", left: "88%", size: 40, delay: 1 },
  {
    id: "b3",
    icon: "barbell" as const,
    top: "4%",
    left: "45%",
    size: 48,
    delay: 2,
  },
  { id: "b4", icon: DollarSign, top: "35%", left: "92%", size: 28, delay: 0.5 },
  { id: "b5", icon: Dumbbell, top: "60%", left: "3%", size: 44, delay: 1.5 },
  {
    id: "b6",
    icon: "barbell" as const,
    top: "70%",
    left: "80%",
    size: 40,
    delay: 0.8,
  },
  { id: "b7", icon: DollarSign, top: "80%", left: "20%", size: 32, delay: 2.2 },
  { id: "b8", icon: Dumbbell, top: "50%", left: "60%", size: 36, delay: 1.2 },
  {
    id: "b9",
    icon: "barbell" as const,
    top: "88%",
    left: "55%",
    size: 44,
    delay: 0.3,
  },
  {
    id: "b10",
    icon: DollarSign,
    top: "25%",
    left: "25%",
    size: 24,
    delay: 1.8,
  },
  { id: "b11", icon: Dumbbell, top: "42%", left: "75%", size: 40, delay: 0.6 },
  {
    id: "b12",
    icon: DollarSign,
    top: "92%",
    left: "10%",
    size: 32,
    delay: 2.5,
  },
];

function FloatingIcons({ theme }: { theme: Theme }) {
  const icons =
    theme === "girlish" ? floatingIconsGirlish : floatingIconsBoyish;
  const isGirlish = theme === "girlish";

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {icons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{ top: item.top, left: item.left }}
          animate={{ y: [0, -18, 0], opacity: [0.18, 0.32, 0.18] }}
          transition={{
            duration: 4 + item.delay,
            repeat: Number.POSITIVE_INFINITY,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          {item.icon === "barbell" ? (
            <BarbellSVG size={item.size} />
          ) : (
            <item.icon
              size={item.size}
              color={isGirlish ? "rgba(244,114,182,0.4)" : `${BOY.accent}44`}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Theme Toggle ──────────────────────────────────────────────────────────────
function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  const isGirlish = theme === "girlish";
  return (
    <button
      type="button"
      data-ocid="app.theme.toggle"
      onClick={onToggle}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-semibold transition-all duration-300 ${
        isGirlish
          ? "bg-white text-pink-500 border-2 border-pink-200 font-girlish"
          : "font-boyish uppercase tracking-widest text-white"
      }`}
      style={
        isGirlish
          ? {}
          : {
              background: BOY.card,
              border: `1px solid ${BOY.border}`,
            }
      }
    >
      <div
        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
          isGirlish ? "bg-pink-400" : ""
        }`}
        style={isGirlish ? {} : { background: BOY.border }}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${
            isGirlish ? "left-0.5 bg-white" : "left-5"
          }`}
          style={isGirlish ? {} : { background: BOY.accent }}
        />
      </div>
      <span>{isGirlish ? "🌸 Girlish" : "💪 Boyish"}</span>
    </button>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ theme, onOpen }: { theme: Theme; onOpen: () => void }) {
  const [isOpening, setIsOpening] = useState(false);
  const isGirlish = theme === "girlish";

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 relative z-10 ${
        isGirlish ? "font-girlish" : "font-boyish"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1
          className={`text-4xl md:text-6xl font-bold mb-4 ${
            isGirlish
              ? "text-pink-600"
              : "font-boyish uppercase tracking-widest"
          }`}
          style={
            isGirlish
              ? {}
              : {
                  color: BOY.accentText,
                  textShadow: `0 0 30px ${BOY.accent}55`,
                }
          }
        >
          Our Personal Diary
        </h1>
        <p
          className={`text-lg md:text-xl max-w-2xl mx-auto ${
            isGirlish ? "text-pink-400" : ""
          }`}
          style={isGirlish ? {} : { color: BOY.textMuted }}
        >
          Don&apos;t like physical books? Boring to write? No worries — we
          present to you the best safest online diary
        </p>
      </motion.div>

      {/* 3D Book with page edges and inner spread */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-10 relative select-none"
        style={{ perspective: "1400px" }}
      >
        {/* Book container — static, shows inner pages and spine */}
        <div
          style={{
            width: 260,
            height: 320,
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Page edges stack (right side) — visible side of the book pages */}
          <div
            style={{
              position: "absolute",
              right: -14,
              top: 6,
              bottom: 6,
              width: 16,
              borderRadius: "0 3px 3px 0",
              background:
                "repeating-linear-gradient(to bottom, #f0ebe0 0px, #f0ebe0 2px, #e5ddd0 2px, #e5ddd0 3px)",
              boxShadow: "2px 0 8px rgba(0,0,0,0.18)",
              zIndex: 1,
            }}
          />

          {/* Spine left side */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 14,
              borderRadius: "4px 0 0 4px",
              background: isGirlish
                ? "linear-gradient(to right, #d06090, #e880a8)"
                : `linear-gradient(to right, #8a0000, ${BOY.accent})`,
              boxShadow: isGirlish
                ? "-2px 0 8px rgba(200,100,150,0.4)"
                : `-2px 0 8px ${BOY.accent}66`,
              zIndex: 3,
            }}
          />

          {/* Inner pages spread — revealed when cover opens */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "0 4px 4px 0",
              background: "#faf8f3",
              display: "flex",
              overflow: "hidden",
              zIndex: 2,
            }}
          >
            {/* Left inner page */}
            <div
              style={{
                flex: 1,
                background:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, #ddd 23px, #ddd 24px)",
                borderRight: "1px solid #d0c8b8",
                paddingTop: 32,
                paddingLeft: 16,
                paddingRight: 12,
              }}
            >
              <p
                style={{
                  fontSize: 8,
                  color: "#888",
                  fontFamily: "serif",
                  lineHeight: "24px",
                }}
              >
                {isGirlish ? "🌸 Dear Diary..." : "My Thoughts..."}
              </p>
            </div>
            {/* Right inner page */}
            <div
              style={{
                flex: 1,
                background:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, #ddd 23px, #ddd 24px)",
                paddingTop: 32,
                paddingLeft: 12,
                paddingRight: 16,
              }}
            />
          </div>

          {/* Front cover — the flipping element */}
          <motion.div
            onClick={handleOpen}
            animate={isOpening ? { rotateY: -162 } : { rotateY: 0 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => {
              if (isOpening) {
                setTimeout(onOpen, 200);
              }
            }}
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              cursor: isOpening ? "default" : "pointer",
              zIndex: 4,
            }}
          >
            {/* Front face of cover */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "0 6px 6px 0",
                backfaceVisibility: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                ...(isGirlish
                  ? {
                      background:
                        "linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)",
                      boxShadow:
                        "4px 6px 24px rgba(0,0,0,0.3), inset -3px 0 8px rgba(0,0,0,0.12)",
                    }
                  : {
                      background:
                        "linear-gradient(160deg, #0a0a0a 0%, #1a0000 60%, #0d0000 100%)",
                      borderLeft: `4px solid ${BOY.accent}`,
                      boxShadow: `4px 6px 24px rgba(0,0,0,0.8), inset -3px 0 8px ${BOY.accent}22`,
                    }),
              }}
            >
              {isGirlish ? (
                <>
                  <div style={{ fontSize: 56, marginBottom: 10 }}>🌸</div>
                  <p
                    style={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: 15,
                      textAlign: "center",
                      textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      fontFamily: "inherit",
                      lineHeight: 1.4,
                    }}
                  >
                    Our Personal
                    <br />
                    Diary
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {["🌷", "🌼", "🌺"].map((f) => (
                      <span key={f} style={{ fontSize: 18 }}>
                        {f}
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      marginTop: 28,
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 11,
                      letterSpacing: 1,
                    }}
                  >
                    ✦ tap to open ✦
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 46, marginBottom: 10 }}>📓</div>
                  <p
                    style={{
                      color: BOY.accentText,
                      fontWeight: 700,
                      fontSize: 14,
                      textAlign: "center",
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      fontFamily: "inherit",
                      lineHeight: 1.5,
                    }}
                  >
                    Our Personal
                    <br />
                    Diary
                  </p>
                  <div
                    style={{
                      width: 48,
                      height: 2,
                      background: BOY.accent,
                      marginTop: 12,
                    }}
                  />
                  <p
                    style={{
                      marginTop: 28,
                      color: BOY.textMuted,
                      fontSize: 10,
                      letterSpacing: 2,
                    }}
                  >
                    TAP TO OPEN
                  </p>
                </>
              )}
            </div>

            {/* Back face of cover (inner cover — cream) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "0 6px 6px 0",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                background: "#f5f0e6",
                borderLeft: "2px solid #e0d8c8",
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Open Button */}
      <motion.button
        type="button"
        data-ocid="landing.primary_button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={isOpening ? {} : { scale: 1.05 }}
        whileTap={isOpening ? {} : { scale: 0.97 }}
        onClick={handleOpen}
        disabled={isOpening}
        className={`px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all duration-200 ${
          isGirlish
            ? "bg-pink-500 text-white hover:bg-pink-600 font-girlish"
            : "font-boyish uppercase tracking-widest text-white"
        }`}
        style={isGirlish ? {} : { background: BOY.accent }}
      >
        <span className="flex items-center gap-2">
          <BookOpen size={20} />
          {isOpening ? "Opening..." : "Open Diary"}
        </span>
      </motion.button>
    </div>
  );
}

// ─── PIN Lock ──────────────────────────────────────────────────────────────────
function PinLock({
  theme,
  correctPin,
  onUnlock,
}: {
  theme: Theme;
  correctPin: string;
  onUnlock: () => void;
}) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const isGirlish = theme === "girlish";

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    if (next.length === 4) {
      if (next === correctPin) {
        setPin(next);
        setSuccess(true);
        setTimeout(onUnlock, 800);
      } else {
        setPin(next);
        setShake(true);
        setTimeout(() => {
          setPin("");
          setShake(false);
        }, 700);
      }
    } else {
      setPin(next);
    }
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-h-screen flex items-center justify-center px-4 relative z-10"
    >
      <div
        className={`rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center ${
          isGirlish
            ? "bg-white border-2 border-pink-200 font-girlish"
            : "font-boyish"
        }`}
        style={
          isGirlish
            ? {}
            : {
                background: BOY.card,
                border: `1px solid ${BOY.border}`,
              }
        }
      >
        <motion.div
          animate={
            success
              ? { scale: [1, 1.3, 1], color: ["#888", "#22c55e", "#22c55e"] }
              : {}
          }
          className={`mb-4 flex justify-center ${isGirlish ? "text-pink-400" : ""}`}
          style={isGirlish ? {} : { color: BOY.textMuted }}
        >
          <Lock size={48} />
        </motion.div>

        <h2
          className={`text-2xl font-bold mb-2 ${
            isGirlish
              ? "text-pink-600"
              : "font-boyish uppercase tracking-widest"
          }`}
          style={isGirlish ? {} : { color: BOY.accentText }}
        >
          Enter Your PIN
        </h2>
        <p
          className={`text-sm mb-6 ${isGirlish ? "text-pink-300" : ""}`}
          style={isGirlish ? {} : { color: BOY.textMuted }}
        >
          Enter 4-digit PIN to unlock
        </p>

        <motion.div
          data-ocid="pin.input"
          animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center gap-4 mb-8"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length
                  ? success
                    ? "bg-green-500 border-green-500"
                    : shake
                      ? "bg-red-500 border-red-500"
                      : isGirlish
                        ? "bg-pink-500 border-pink-500"
                        : ""
                  : isGirlish
                    ? "border-pink-300 bg-transparent"
                    : ""
              }`}
              style={
                !isGirlish && i < pin.length && !success && !shake
                  ? { background: BOY.accent, borderColor: BOY.accent }
                  : !isGirlish && !(i < pin.length)
                    ? { borderColor: BOY.border, background: "transparent" }
                    : {}
              }
            />
          ))}
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {keys.map((k) => (
            <motion.button
              type="button"
              key={k}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleDigit(k)}
              className={`py-4 rounded-2xl text-xl font-bold transition-colors ${
                isGirlish
                  ? "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200"
                  : "font-boyish"
              }`}
              style={
                isGirlish
                  ? {}
                  : {
                      background: BOY.bg,
                      color: BOY.text,
                      border: `1px solid ${BOY.border}`,
                    }
              }
            >
              {k}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div />
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleDigit("0")}
            className={`py-4 rounded-2xl text-xl font-bold transition-colors ${
              isGirlish
                ? "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200"
                : "font-boyish"
            }`}
            style={
              isGirlish
                ? {}
                : {
                    background: BOY.bg,
                    color: BOY.text,
                    border: `1px solid ${BOY.border}`,
                  }
            }
          >
            0
          </motion.button>
          <motion.button
            type="button"
            data-ocid="pin.delete_button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleDelete}
            className={`py-4 rounded-2xl text-xl font-bold transition-colors ${
              isGirlish
                ? "bg-pink-100 text-pink-500 hover:bg-pink-200 border border-pink-200"
                : "font-boyish"
            }`}
            style={
              isGirlish
                ? {}
                : {
                    background: BOY.bg,
                    color: BOY.accentText,
                    border: `1px solid ${BOY.border}`,
                  }
            }
          >
            ⌫
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Plain Page ────────────────────────────────────────────────────────────────
function PlainPage({
  theme,
  actor,
}: { theme: Theme; actor: ReturnType<typeof useActor>["actor"] }) {
  const [pages, setPages] = useState<string[]>([""]);
  const [currentPage, setCurrentPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const isGirlish = theme === "girlish";

  const handleChange = (value: string) => {
    setPages((prev) => {
      const next = [...prev];
      next[currentPage] = value;
      return next;
    });
  };

  const handleNextPage = () => {
    const nextIdx = currentPage + 1;
    if (nextIdx >= pages.length) {
      setPages((prev) => [...prev, ""]);
    }
    setCurrentPage(nextIdx);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleSave = async () => {
    const hasContent = pages.some((p) => p.trim());
    if (!hasContent) return;
    const fullContent = pages
      .map((p, i) => (i === 0 ? p : `\n--- Page ${i + 1} ---\n${p}`))
      .join("");
    setSaving(true);
    try {
      if (actor) await actor.addDiaryEntry(fullContent, PageType.plain);
      const count = pages.filter((p) => p.trim()).length;
      toast.success(`Saved ${count} page${count > 1 ? "s" : ""}!`);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-2">
      {/* Page indicator */}
      <div className="flex items-center justify-between">
        <span
          data-ocid="plain.page.tab"
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isGirlish ? "bg-pink-100 text-pink-600 font-girlish" : ""
          }`}
          style={
            isGirlish
              ? {}
              : {
                  background: `${BOY.accent}22`,
                  color: BOY.accent,
                  fontFamily: "inherit",
                }
          }
        >
          Page {currentPage + 1} of {pages.length}
        </span>
      </div>

      <textarea
        data-ocid="plain.editor"
        value={pages[currentPage]}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write your thoughts freely..."
        rows={12}
        className={`w-full resize-none outline-none text-base p-2 rounded-lg ${
          isGirlish
            ? "text-rose-800 placeholder-pink-300 font-girlish bg-transparent"
            : "font-boyish bg-transparent"
        }`}
        style={{
          height: 320,
          lineHeight: "26px",
          ...(isGirlish ? {} : { color: BOY.pageText }),
        }}
      />

      <div className="flex items-center justify-between mt-1">
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid="plain.prev_button"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-40 ${
              isGirlish
                ? "bg-pink-100 text-pink-600 hover:bg-pink-200 font-girlish"
                : "font-boyish text-white"
            }`}
            style={
              isGirlish
                ? {}
                : {
                    background: BOY.card,
                    border: `1px solid ${BOY.border}`,
                    color: BOY.text,
                  }
            }
          >
            ← Prev
          </button>
          <button
            type="button"
            data-ocid="plain.next_button"
            onClick={handleNextPage}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isGirlish
                ? "bg-pink-100 text-pink-600 hover:bg-pink-200 font-girlish"
                : "font-boyish text-white"
            }`}
            style={
              isGirlish
                ? {}
                : {
                    background: BOY.card,
                    border: `1px solid ${BOY.border}`,
                    color: BOY.text,
                  }
            }
          >
            Next →
          </button>
        </div>
        <button
          type="button"
          data-ocid="plain.save_button"
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2 rounded-full font-semibold text-sm shadow transition-all ${
            isGirlish
              ? "bg-pink-500 text-white hover:bg-pink-600 font-girlish"
              : "font-boyish uppercase tracking-wider text-white"
          }`}
          style={isGirlish ? {} : { background: BOY.accent }}
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </div>
  );
}

// ─── Normal Page ───────────────────────────────────────────────────────────────
function NormalPage({
  theme,
  actor,
}: { theme: Theme; actor: ReturnType<typeof useActor>["actor"] }) {
  const [pages, setPages] = useState<string[]>([""]);
  const [currentPage, setCurrentPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const isGirlish = theme === "girlish";

  const handleChange = (value: string) => {
    setPages((prev) => {
      const next = [...prev];
      next[currentPage] = value;
      return next;
    });
  };

  const handleNextPage = () => {
    const nextIdx = currentPage + 1;
    if (nextIdx >= pages.length) {
      setPages((prev) => [...prev, ""]);
    }
    setCurrentPage(nextIdx);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleSave = async () => {
    const hasContent = pages.some((p) => p.trim());
    if (!hasContent) return;
    const fullContent = pages
      .map((p, i) => (i === 0 ? p : `\n--- Page ${i + 1} ---\n${p}`))
      .join("");
    setSaving(true);
    try {
      if (actor) await actor.addDiaryEntry(fullContent, PageType.normal);
      const count = pages.filter((p) => p.trim()).length;
      toast.success(`Saved ${count} page${count > 1 ? "s" : ""}!`);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-2">
      {/* Page indicator */}
      <div className="flex items-center justify-between">
        <span
          data-ocid="normal.page.tab"
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isGirlish ? "bg-pink-100 text-pink-600 font-girlish" : ""
          }`}
          style={
            isGirlish
              ? {}
              : {
                  background: `${BOY.accent}22`,
                  color: BOY.accent,
                  fontFamily: "inherit",
                }
          }
        >
          Page {currentPage + 1} of {pages.length}
        </span>
      </div>

      <div className="relative" style={{ height: 320 }}>
        <div
          className="absolute top-0 bottom-0 left-10 w-px"
          style={{
            background: isGirlish ? "#f9a8c9" : BOY.accent,
            opacity: 0.6,
          }}
        />
        <textarea
          data-ocid="normal.editor"
          value={pages[currentPage]}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write on lined paper..."
          rows={12}
          className={`w-full h-full resize-none outline-none text-base bg-transparent pl-14 pr-2 ${
            isGirlish
              ? "text-rose-800 placeholder-pink-300 font-girlish lined-paper"
              : "font-boyish lined-paper-boy"
          }`}
          style={{
            lineHeight: "26.67px",
            ...(isGirlish ? {} : { color: BOY.pageText }),
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid="normal.prev_button"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-40 ${
              isGirlish
                ? "bg-pink-100 text-pink-600 hover:bg-pink-200 font-girlish"
                : "font-boyish text-white"
            }`}
            style={
              isGirlish
                ? {}
                : {
                    background: BOY.card,
                    border: `1px solid ${BOY.border}`,
                    color: BOY.text,
                  }
            }
          >
            ← Prev
          </button>
          <button
            type="button"
            data-ocid="normal.next_button"
            onClick={handleNextPage}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isGirlish
                ? "bg-pink-100 text-pink-600 hover:bg-pink-200 font-girlish"
                : "font-boyish text-white"
            }`}
            style={
              isGirlish
                ? {}
                : {
                    background: BOY.card,
                    border: `1px solid ${BOY.border}`,
                    color: BOY.text,
                  }
            }
          >
            Next →
          </button>
        </div>
        <button
          type="button"
          data-ocid="normal.save_button"
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2 rounded-full font-semibold text-sm shadow transition-all ${
            isGirlish
              ? "bg-pink-500 text-white hover:bg-pink-600 font-girlish"
              : "font-boyish uppercase tracking-wider text-white"
          }`}
          style={isGirlish ? {} : { background: BOY.accent }}
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </div>
  );
}

// ─── Habit Tracker ─────────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function HabitTracker({
  theme,
  actor,
  habits,
  setHabits,
}: {
  theme: Theme;
  actor: ReturnType<typeof useActor>["actor"];
  habits: HabitItem[];
  setHabits: React.Dispatch<React.SetStateAction<HabitItem[]>>;
}) {
  const [newHabit, setNewHabit] = useState("");
  const isGirlish = theme === "girlish";

  const addHabit = async () => {
    if (!newHabit.trim()) return;
    if (habits.length >= 15) {
      toast.error("Maximum 15 habits reached");
      return;
    }
    const item: HabitItem = {
      id: Date.now(),
      name: newHabit.trim(),
      days: new Array(7).fill(false),
      startDate: new Date().toISOString().split("T")[0],
    };
    setHabits((h) => [...h, item]);
    try {
      if (actor)
        await actor.addHabit({
          name: newHabit.trim(),
          goal: BigInt(7),
          frequency: BigInt(1),
        });
    } catch {
      /* silent */
    }
    setNewHabit("");
    toast.success("Habit added!");
  };

  const toggleDay = (hid: number, di: number) => {
    setHabits((hs) =>
      hs.map((h) =>
        h.id === hid
          ? { ...h, days: h.days.map((d, idx) => (idx === di ? !d : d)) }
          : h,
      ),
    );
  };

  const deleteHabit = (hid: number) => {
    setHabits((hs) => hs.filter((h) => h.id !== hid));
    toast.success("Habit removed");
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto p-2">
      <p
        className={`text-xs font-semibold ${isGirlish ? "text-pink-400" : ""}`}
        style={isGirlish ? {} : { color: BOY.textMuted }}
      >
        {today}
      </p>

      <div className="flex gap-2">
        <input
          data-ocid="habit.input"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder={
            habits.length >= 15 ? "Max 15 habits reached" : "New habit..."
          }
          disabled={habits.length >= 15}
          className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none border ${
            isGirlish
              ? "bg-pink-50 border-pink-200 text-pink-800 placeholder-pink-300 font-girlish"
              : "font-boyish"
          }`}
          style={
            isGirlish
              ? {}
              : {
                  background: isGirlish ? undefined : "#f9f9f9",
                  borderColor: BOY.border,
                  color: BOY.pageText,
                }
          }
        />
        <button
          type="button"
          data-ocid="habit.add_button"
          onClick={addHabit}
          disabled={habits.length >= 15}
          className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 ${
            isGirlish
              ? "bg-pink-500 text-white hover:bg-pink-600"
              : "text-white font-boyish"
          } disabled:opacity-50`}
          style={isGirlish ? {} : { background: BOY.accent }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <p
        className={`text-xs ${isGirlish ? "text-pink-400" : ""}`}
        style={isGirlish ? {} : { color: BOY.textMuted }}
      >
        {habits.length}/15 habits
        {habits.length >= 15 && " — Maximum reached"}
      </p>

      {habits.length === 0 ? (
        <div
          data-ocid="habit.empty_state"
          className={`flex-1 flex flex-col items-center justify-center gap-2 ${
            isGirlish ? "text-pink-300" : ""
          }`}
          style={isGirlish ? {} : { color: BOY.textMuted }}
        >
          <CheckSquare size={40} />
          <p className="text-sm">No habits yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit, hi) => (
            <div
              key={habit.id}
              className={`rounded-xl p-3 border ${
                isGirlish ? "bg-pink-50 border-pink-200" : ""
              }`}
              style={
                isGirlish
                  ? {}
                  : { background: "#f9f9f9", borderColor: "#e5e5e5" }
              }
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-semibold text-sm ${isGirlish ? "text-pink-700 font-girlish" : "font-boyish"}`}
                  style={isGirlish ? {} : { color: BOY.pageText }}
                >
                  {habit.name}
                </span>
                <button
                  type="button"
                  data-ocid={`habit.delete_button.${hi + 1}`}
                  onClick={() => deleteHabit(habit.id)}
                  className={`${
                    isGirlish
                      ? "text-pink-300 hover:text-pink-500"
                      : "hover:opacity-70"
                  }`}
                  style={isGirlish ? {} : { color: BOY.accent }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day, di) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span
                      className={`text-xs ${isGirlish ? "text-pink-400" : ""}`}
                      style={isGirlish ? {} : { color: BOY.textMuted }}
                    >
                      {day}
                    </span>
                    <button
                      type="button"
                      data-ocid={
                        hi === 0 ? `habit.checkbox.${di + 1}` : undefined
                      }
                      onClick={() => toggleDay(habit.id, di)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        habit.days[di]
                          ? isGirlish
                            ? "bg-pink-400 border-pink-400 text-white"
                            : "text-white"
                          : isGirlish
                            ? "border-pink-200 bg-transparent"
                            : ""
                      }`}
                      style={
                        !isGirlish
                          ? habit.days[di]
                            ? {
                                background: BOY.accent,
                                borderColor: BOY.accent,
                              }
                            : {
                                borderColor: "#ccc",
                                background: "transparent",
                              }
                          : {}
                      }
                    >
                      {habit.days[di] && <span className="text-xs">✓</span>}
                    </button>
                  </div>
                ))}
              </div>

              {/* Trading-style progress chart */}
              <div className="mt-3">
                <svg
                  role="img"
                  aria-label="Habit progress chart"
                  width="100%"
                  height="50"
                  viewBox="0 0 280 50"
                  preserveAspectRatio="none"
                >
                  <title>Habit progress chart</title>
                  {habit.days.map((done, di) => {
                    const x = di * 40 + 4;
                    const barHeight = done ? 38 : 12;
                    const barY = done ? 8 : 38;
                    const color = done ? "#22c55e" : "#ef4444";
                    return (
                      <g key={DAYS[di]}>
                        <rect
                          x={x}
                          y={barY}
                          width="32"
                          height={barHeight}
                          rx="3"
                          fill={color}
                          opacity="0.85"
                        />
                      </g>
                    );
                  })}
                </svg>
                <p
                  className="text-xs mt-1"
                  style={{ color: isGirlish ? "#f9a8d4" : "#aaa" }}
                >
                  Started:{" "}
                  {habit.startDate
                    ? new Date(habit.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Today"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Time Tracker ──────────────────────────────────────────────────────────────
type TTab = "day" | "week" | "month" | "year";

function TimeTracker({
  theme,
  actor,
}: { theme: Theme; actor: ReturnType<typeof useActor>["actor"] }) {
  const [activeTab, setActiveTab] = useState<TTab>("day");
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      id: 1,
      title: "Started morning runs",
      date: "2026-03-01",
      category: "day",
    },
    {
      id: 2,
      title: "Finished design course",
      date: "2026-02-28",
      category: "week",
    },
    { id: 3, title: "Lost 5 pounds", date: "2026-02-01", category: "month" },
    { id: 4, title: "Promoted at work", date: "2025-12-15", category: "year" },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const isGirlish = theme === "girlish";
  const tabs: TTab[] = ["day", "week", "month", "year"];

  const addMilestone = async () => {
    if (!newTitle.trim()) return;
    const item: MilestoneItem = {
      id: Date.now(),
      title: newTitle.trim(),
      date: newDate || new Date().toISOString().split("T")[0],
      category: activeTab,
    };
    setMilestones((m) => [...m, item]);
    try {
      const catMap: Record<TTab, Variant_day_month_week_year> = {
        day: Variant_day_month_week_year.day,
        week: Variant_day_month_week_year.week,
        month: Variant_day_month_week_year.month,
        year: Variant_day_month_week_year.year,
      };
      if (actor) await actor.addMilestone(newTitle.trim(), catMap[activeTab]);
    } catch {
      /* silent */
    }
    setNewTitle("");
    setNewDate("");
    toast.success("Milestone added!");
  };

  const filtered = milestones.filter((m) => m.category === activeTab);

  return (
    <div className="h-full flex flex-col gap-4 p-2">
      <div
        className="flex gap-1 rounded-xl p-1 self-start"
        style={{ background: isGirlish ? "#fce4ec" : BOY.sidebar }}
      >
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab}
            data-ocid="timetracker.tab"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? isGirlish
                  ? "bg-pink-500 text-white shadow"
                  : "text-white shadow font-boyish uppercase tracking-wider"
                : isGirlish
                  ? "text-pink-500 hover:bg-pink-100"
                  : "font-boyish uppercase tracking-wider"
            }`}
            style={
              !isGirlish
                ? activeTab === tab
                  ? { background: BOY.accent }
                  : { color: BOY.textMuted }
                : {}
            }
          >
            {tab === "day"
              ? "Days"
              : tab === "week"
                ? "Weeks"
                : tab === "month"
                  ? "Months"
                  : "Years"}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          data-ocid="timetracker.input"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMilestone()}
          placeholder="Milestone title..."
          className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm outline-none border ${
            isGirlish
              ? "bg-pink-50 border-pink-200 text-pink-800 placeholder-pink-300 font-girlish"
              : "font-boyish"
          }`}
          style={
            isGirlish
              ? {}
              : {
                  background: "#f9f9f9",
                  borderColor: "#e5e5e5",
                  color: BOY.pageText,
                }
          }
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className={`px-3 py-2 rounded-lg text-sm outline-none border ${
            isGirlish ? "bg-pink-50 border-pink-200 text-pink-700" : ""
          }`}
          style={
            isGirlish
              ? {}
              : {
                  background: "#f9f9f9",
                  borderColor: "#e5e5e5",
                  color: BOY.textMuted,
                }
          }
        />
        <button
          type="button"
          data-ocid="timetracker.add_button"
          onClick={addMilestone}
          className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 ${
            isGirlish
              ? "bg-pink-500 text-white hover:bg-pink-600"
              : "text-white font-boyish"
          }`}
          style={isGirlish ? {} : { background: BOY.accent }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filtered.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-32 gap-2 ${
              isGirlish ? "text-pink-300" : ""
            }`}
            style={isGirlish ? {} : { color: BOY.textMuted }}
          >
            <Clock size={32} />
            <p className="text-sm">No milestones for this period yet.</p>
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isGirlish ? "bg-pink-50 border-pink-200" : ""
              }`}
              style={
                isGirlish
                  ? {}
                  : { background: "#f9f9f9", borderColor: "#e5e5e5" }
              }
            >
              <div>
                <p
                  className={`font-semibold text-sm ${
                    isGirlish ? "text-pink-700 font-girlish" : "font-boyish"
                  }`}
                  style={isGirlish ? {} : { color: BOY.pageText }}
                >
                  {m.title}
                </p>
                <p
                  className={`text-xs mt-0.5 ${isGirlish ? "text-pink-400" : ""}`}
                  style={isGirlish ? {} : { color: BOY.textMuted }}
                >
                  {m.date}
                </p>
              </div>
              <ChevronRight
                size={16}
                className={isGirlish ? "text-pink-300" : ""}
                style={isGirlish ? {} : { color: "#ccc" }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Saved Entries ─────────────────────────────────────────────────────────────
const PAGE_TYPE_LABELS: Record<string, string> = {
  plain: "Plain Page",
  normal: "Normal Page",
  habit: "Habit Tracker",
  timetracker: "Time Tracker",
};

function formatDate(ts: bigint): string {
  try {
    const ms = Number(ts / BigInt(1_000_000));
    return new Date(ms).toLocaleString();
  } catch {
    return "";
  }
}

function SavedEntries({
  theme,
  actor,
}: { theme: Theme; actor: ReturnType<typeof useActor>["actor"] }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isGirlish = theme === "girlish";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (actor) {
          const data = await actor.getDiaryEntries();
          if (!cancelled) setEntries(data);
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [actor]);

  const filteredEntries = searchQuery.trim()
    ? entries.filter(
        (e) =>
          e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatDate(e.timestamp)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : entries;

  if (loading) {
    return (
      <div
        data-ocid="saved.loading_state"
        className={`flex-1 flex items-center justify-center ${
          isGirlish ? "text-pink-300" : ""
        }`}
        style={isGirlish ? {} : { color: BOY.textMuted }}
      >
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        data-ocid="saved.empty_state"
        className={`flex-1 flex flex-col items-center justify-center gap-2 h-48 text-center ${
          isGirlish ? "text-pink-300" : ""
        }`}
        style={isGirlish ? {} : { color: BOY.textMuted }}
      >
        <BookOpen size={40} />
        <p className="text-sm font-semibold">No entries saved yet.</p>
        <p className="text-xs">Write something and hit Save Entry!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 p-2">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: isGirlish ? "#f9a8d4" : BOY.textMuted }}
        />
        <input
          data-ocid="saved.search_input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by content or date..."
          className={`w-full pl-8 pr-3 py-2 text-sm rounded-xl border outline-none transition-all ${
            isGirlish
              ? "bg-pink-50 border-pink-200 text-pink-800 placeholder-pink-300 font-girlish focus:border-pink-400"
              : "font-boyish focus:border-gray-400"
          }`}
          style={
            isGirlish
              ? {}
              : {
                  background: "#f3f3f3",
                  borderColor: "#e0e0e0",
                  color: BOY.pageText,
                }
          }
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredEntries.length === 0 ? (
          <div
            data-ocid="saved.empty_state"
            className={`flex flex-col items-center justify-center gap-2 h-40 text-center ${
              isGirlish ? "text-pink-300" : ""
            }`}
            style={isGirlish ? {} : { color: BOY.textMuted }}
          >
            <Search size={36} />
            <p className="text-sm font-semibold">
              No entries match your search.
            </p>
            <p className="text-xs">Try a different keyword or date.</p>
          </div>
        ) : (
          filteredEntries.map((entry, i) => (
            <motion.div
              key={entry.id.toString()}
              data-ocid={`saved.item.${i + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl p-4 border ${
                isGirlish ? "bg-pink-50 border-pink-200" : ""
              }`}
              style={
                isGirlish
                  ? {}
                  : {
                      background: "#ffffff",
                      borderColor: "#e5e5e5",
                      borderLeft: `3px solid ${BOY.accent}`,
                    }
              }
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isGirlish
                      ? "bg-pink-200 text-pink-700 font-girlish"
                      : "font-boyish"
                  }`}
                  style={
                    isGirlish
                      ? {}
                      : { background: `${BOY.accent}22`, color: BOY.accent }
                  }
                >
                  {PAGE_TYPE_LABELS[entry.pageType] ?? entry.pageType}
                </span>
                <span
                  className={`text-xs ${isGirlish ? "text-pink-300" : ""}`}
                  style={isGirlish ? {} : { color: BOY.textMuted }}
                >
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              <p
                className={`text-sm leading-relaxed line-clamp-3 ${
                  isGirlish ? "text-rose-700 font-girlish" : ""
                }`}
                style={isGirlish ? {} : { color: BOY.pageText }}
              >
                {entry.content.slice(0, 100)}
                {entry.content.length > 100 ? "..." : ""}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage({
  theme,
  customPin,
  onPinChange,
  habits,
  setHabits,
}: {
  theme: Theme;
  customPin: string;
  onPinChange: (newPin: string) => void;
  habits: HabitItem[];
  setHabits: React.Dispatch<React.SetStateAction<HabitItem[]>>;
}) {
  const isGirlish = theme === "girlish";
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [newHabitName, setNewHabitName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const accent = isGirlish ? "#ec4899" : BOY.accent;
  const inputStyle = isGirlish
    ? {}
    : { background: "#f9f9f9", borderColor: "#e5e5e5", color: BOY.pageText };
  const inputClass = isGirlish
    ? "bg-pink-50 border-pink-200 text-pink-800 placeholder-pink-300 font-girlish"
    : "border";
  const btnClass = isGirlish
    ? "bg-pink-500 text-white hover:bg-pink-600 font-girlish"
    : "text-white font-boyish";
  const btnStyle = isGirlish ? {} : { background: BOY.accent };
  const sectionStyle = isGirlish
    ? { borderColor: "#fbcfe8" }
    : { borderColor: "#e5e5e5" };
  const labelClass = isGirlish
    ? "text-pink-600 font-semibold font-girlish"
    : "font-bold font-boyish";
  const labelStyle = isGirlish ? {} : { color: BOY.pageText };
  const headingStyle = isGirlish ? {} : { color: BOY.accent };

  const handleUpdatePin = () => {
    setPinError("");
    if (currentPin !== customPin) {
      setPinError("Current PIN is incorrect");
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setPinError("New PIN must be exactly 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    onPinChange(newPin);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    toast.success("PIN updated successfully!");
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    if (habits.length >= 15) {
      toast.error("Maximum 15 habits reached");
      return;
    }
    const item: HabitItem = {
      id: Date.now(),
      name: newHabitName.trim(),
      days: new Array(7).fill(false),
      startDate: new Date().toISOString().split("T")[0],
    };
    setHabits((h) => [...h, item]);
    setNewHabitName("");
    toast.success("Habit added!");
  };

  const handleSaveEdit = (id: number) => {
    if (!editingName.trim()) return;
    setHabits((hs) =>
      hs.map((h) => (h.id === id ? { ...h, name: editingName.trim() } : h)),
    );
    setEditingId(null);
    setEditingName("");
    toast.success("Habit renamed!");
  };

  const handleDeleteHabit = (id: number) => {
    setHabits((hs) => hs.filter((h) => h.id !== id));
    toast.success("Habit removed");
  };

  return (
    <div className="h-full overflow-y-auto space-y-8 p-2">
      {/* Section 1: Change PIN */}
      <section
        className="border rounded-2xl p-6 space-y-4"
        style={sectionStyle}
      >
        <h3
          className={`text-lg font-bold flex items-center gap-2 ${
            isGirlish
              ? "text-pink-600 font-girlish"
              : "font-boyish uppercase tracking-widest"
          }`}
          style={headingStyle}
        >
          <Lock size={18} />
          Change PIN
        </h3>
        <p
          className={`text-xs ${isGirlish ? "text-pink-400" : ""}`}
          style={isGirlish ? {} : { color: BOY.textMuted }}
        >
          Current PIN: {"●".repeat(customPin.length)}
        </p>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="settings-current-pin"
              className={`block text-sm mb-1 ${labelClass}`}
              style={labelStyle}
            >
              Current PIN
            </label>
            <input
              id="settings-current-pin"
              data-ocid="settings.input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter current PIN"
              className={`w-full px-3 py-2 rounded-lg text-sm outline-none border ${inputClass}`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor="settings-new-pin"
              className={`block text-sm mb-1 ${labelClass}`}
              style={labelStyle}
            >
              New PIN
            </label>
            <input
              id="settings-new-pin"
              data-ocid="settings.input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter new 4-digit PIN"
              className={`w-full px-3 py-2 rounded-lg text-sm outline-none border ${inputClass}`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor="settings-confirm-pin"
              className={`block text-sm mb-1 ${labelClass}`}
              style={labelStyle}
            >
              Confirm New PIN
            </label>
            <input
              id="settings-confirm-pin"
              data-ocid="settings.input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Confirm new PIN"
              className={`w-full px-3 py-2 rounded-lg text-sm outline-none border ${inputClass}`}
              style={inputStyle}
            />
          </div>

          {pinError && (
            <p
              data-ocid="settings.error_state"
              className="text-red-500 text-xs font-semibold"
            >
              {pinError}
            </p>
          )}

          <button
            type="button"
            data-ocid="settings.save_button"
            onClick={handleUpdatePin}
            className={`w-full py-2 rounded-xl font-semibold text-sm transition-all ${btnClass}`}
            style={btnStyle}
          >
            Update PIN
          </button>
        </div>
      </section>

      {/* Section 2: Manage Habits */}
      <section
        className="border rounded-2xl p-6 space-y-4"
        style={sectionStyle}
      >
        <div className="flex items-center justify-between">
          <h3
            className={`text-lg font-bold flex items-center gap-2 ${
              isGirlish
                ? "text-pink-600 font-girlish"
                : "font-boyish uppercase tracking-widest"
            }`}
            style={headingStyle}
          >
            <CheckSquare size={18} />
            Manage Habits
          </h3>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isGirlish ? "bg-pink-100 text-pink-600" : ""
            }`}
            style={
              isGirlish
                ? {}
                : {
                    background: `${BOY.accent}22`,
                    color: BOY.accent,
                  }
            }
          >
            {habits.length}/15 habits
          </span>
        </div>

        {/* Add new habit */}
        <div className="flex gap-2">
          <input
            data-ocid="settings.input"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
            placeholder={
              habits.length >= 15
                ? "Maximum 15 habits reached"
                : "New habit name..."
            }
            disabled={habits.length >= 15}
            className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none border ${inputClass} disabled:opacity-50`}
            style={inputStyle}
          />
          <button
            type="button"
            data-ocid="settings.primary_button"
            onClick={handleAddHabit}
            disabled={habits.length >= 15}
            className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 ${btnClass} disabled:opacity-50`}
            style={btnStyle}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {habits.length >= 15 && (
          <p className="text-xs font-semibold" style={{ color: accent }}>
            Maximum 15 habits reached
          </p>
        )}

        {/* Habits list */}
        <div className="space-y-2">
          {habits.length === 0 ? (
            <div
              data-ocid="settings.empty_state"
              className={`text-center py-6 ${isGirlish ? "text-pink-300" : ""}`}
              style={isGirlish ? {} : { color: BOY.textMuted }}
            >
              <p className="text-sm">No habits yet. Add your first one!</p>
            </div>
          ) : (
            habits.map((habit, idx) => (
              <div
                key={habit.id}
                data-ocid={`settings.item.${idx + 1}`}
                className="flex items-center gap-2 p-3 rounded-xl border"
                style={sectionStyle}
              >
                {editingId === habit.id ? (
                  <>
                    <input
                      data-ocid="settings.input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(habit.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingName("");
                        }
                      }}
                      className={`flex-1 px-2 py-1 rounded text-sm outline-none border ${inputClass}`}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      data-ocid="settings.save_button"
                      onClick={() => handleSaveEdit(habit.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${btnClass}`}
                      style={btnStyle}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      data-ocid="settings.cancel_button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        isGirlish
                          ? "bg-pink-100 text-pink-500"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`flex-1 text-sm font-semibold ${
                        isGirlish ? "text-pink-700 font-girlish" : ""
                      }`}
                      style={isGirlish ? {} : { color: BOY.pageText }}
                    >
                      {habit.name}
                    </span>
                    <button
                      type="button"
                      data-ocid={`settings.edit_button.${idx + 1}`}
                      onClick={() => {
                        setEditingId(habit.id);
                        setEditingName(habit.name);
                      }}
                      className={`p-1 rounded transition-opacity hover:opacity-70 ${
                        isGirlish ? "text-pink-400" : ""
                      }`}
                      style={isGirlish ? {} : { color: BOY.accent }}
                      title="Rename habit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      data-ocid={`settings.delete_button.${idx + 1}`}
                      onClick={() => handleDeleteHabit(habit.id)}
                      className={`p-1 rounded transition-opacity hover:opacity-70 ${
                        isGirlish ? "text-pink-300" : ""
                      }`}
                      style={isGirlish ? {} : { color: BOY.accent }}
                      title="Delete habit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Full Screen Page Overlay ─────────────────────────────────────────────────
const NAV_ITEMS: { id: DiaryPage; label: string; icon: any }[] = [
  { id: "plain", label: "Plain Page", icon: FileText },
  { id: "normal", label: "Normal Page", icon: AlignLeft },
  { id: "habit", label: "Habit Tracker", icon: CheckSquare },
  { id: "timetracker", label: "Time Tracker", icon: Clock },
  { id: "saved", label: "Saved Entries", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

const NAV_OCID: Record<DiaryPage, string> = {
  plain: "diary.plain_page.tab",
  normal: "diary.normal_page.tab",
  habit: "diary.habit_tracker.tab",
  timetracker: "diary.time_tracker.tab",
  saved: "diary.saved_entries.tab",
  settings: "diary.settings.tab",
};

function FullPageOverlay({
  theme,
  activePage,
  actor,
  onClose,
  customPin,
  onPinChange,
  habits,
  setHabits,
}: {
  theme: Theme;
  activePage: DiaryPage;
  actor: ReturnType<typeof useActor>["actor"];
  onClose: () => void;
  customPin: string;
  onPinChange: (newPin: string) => void;
  habits: HabitItem[];
  setHabits: React.Dispatch<React.SetStateAction<HabitItem[]>>;
}) {
  const isGirlish = theme === "girlish";
  const navItem = NAV_ITEMS.find((n) => n.id === activePage);

  const renderContent = () => {
    switch (activePage) {
      case "plain":
        return <PlainPage theme={theme} actor={actor} />;
      case "normal":
        return <NormalPage theme={theme} actor={actor} />;
      case "habit":
        return (
          <HabitTracker
            theme={theme}
            actor={actor}
            habits={habits}
            setHabits={setHabits}
          />
        );
      case "timetracker":
        return <TimeTracker theme={theme} actor={actor} />;
      case "saved":
        return <SavedEntries theme={theme} actor={actor} />;
      case "settings":
        return (
          <SettingsPage
            theme={theme}
            customPin={customPin}
            onPinChange={onPinChange}
            habits={habits}
            setHabits={setHabits}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col"
      style={
        isGirlish
          ? {
              background: "linear-gradient(135deg, #fce4ec, #f8bbd0)",
            }
          : {
              background: BOY.bg,
            }
      }
    >
      {/* Top bar */}
      <div
        className={`flex items-center gap-4 px-6 py-4 border-b ${
          isGirlish ? "border-pink-200" : ""
        }`}
        style={isGirlish ? {} : { borderColor: BOY.border }}
      >
        <button
          type="button"
          data-ocid="fullpage.close_button"
          onClick={onClose}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            isGirlish
              ? "bg-pink-200 text-pink-700 hover:bg-pink-300 font-girlish"
              : "font-boyish text-white"
          }`}
          style={
            isGirlish
              ? {}
              : { background: BOY.card, border: `1px solid ${BOY.border}` }
          }
        >
          ← Back to Diary
        </button>
        <h2
          className={`text-xl font-bold flex-1 text-center ${
            isGirlish
              ? "text-pink-700 font-girlish"
              : "font-boyish uppercase tracking-widest"
          }`}
          style={isGirlish ? {} : { color: BOY.accentText }}
        >
          {navItem?.label ?? activePage}
        </h2>
        <div className="w-28" />
      </div>

      {/* Content — white page for boyish */}
      <div
        className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full"
        style={isGirlish ? {} : { background: BOY.pageWhite }}
      >
        {renderContent()}
      </div>
    </motion.div>
  );
}

// ─── Diary Interface ───────────────────────────────────────────────────────────
function DiaryInterface({
  theme,
  actor,
  onLock,
  customPin,
  onPinChange,
}: {
  theme: Theme;
  actor: ReturnType<typeof useActor>["actor"];
  onLock: () => void;
  customPin: string;
  onPinChange: (newPin: string) => void;
}) {
  const [activePage, setActivePage] = useState<DiaryPage>("plain");
  const [fullPageOpen, setFullPageOpen] = useState(false);
  const isGirlish = theme === "girlish";

  const [habits, setHabits] = useState<HabitItem[]>([
    {
      id: 1,
      name: "Morning Walk",
      days: [true, false, true, true, false, false, false],
      startDate: "2026-03-08",
    },
    {
      id: 2,
      name: "Read 20 mins",
      days: [true, true, true, false, true, false, false],
      startDate: "2026-03-10",
    },
    {
      id: 3,
      name: "Drink 8 glasses",
      days: [true, true, false, true, true, true, false],
      startDate: "2026-03-12",
    },
  ]);

  const handleNavClick = (id: DiaryPage) => {
    setActivePage(id);
    setFullPageOpen(true);
  };

  const renderPage = () => {
    switch (activePage) {
      case "plain":
        return <PlainPage theme={theme} actor={actor} />;
      case "normal":
        return <NormalPage theme={theme} actor={actor} />;
      case "habit":
        return (
          <HabitTracker
            theme={theme}
            actor={actor}
            habits={habits}
            setHabits={setHabits}
          />
        );
      case "timetracker":
        return <TimeTracker theme={theme} actor={actor} />;
      case "saved":
        return <SavedEntries theme={theme} actor={actor} />;
      case "settings":
        return (
          <SettingsPage
            theme={theme}
            customPin={customPin}
            onPinChange={onPinChange}
            habits={habits}
            setHabits={setHabits}
          />
        );
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center p-4 relative z-10"
      >
        <div
          className={`w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row ${
            isGirlish ? "bg-white border-2 border-pink-200" : ""
          }`}
          style={{
            minHeight: 600,
            maxHeight: "85vh",
            ...(isGirlish
              ? {}
              : { background: BOY.card, border: `1px solid ${BOY.border}` }),
          }}
        >
          {/* Left Page — Navigation (stays dark for boyish) */}
          <div
            className={`md:w-64 flex-shrink-0 flex flex-col p-6 ${
              isGirlish ? "bg-pink-50 border-r-2 border-pink-200" : ""
            }`}
            style={
              isGirlish
                ? {}
                : {
                    background: BOY.sidebar,
                    borderRight: `1px solid ${BOY.border}`,
                  }
            }
          >
            <div className="mb-6">
              <h2
                className={`text-2xl font-bold ${
                  isGirlish
                    ? "text-pink-600 font-girlish"
                    : "font-boyish uppercase tracking-widest"
                }`}
                style={isGirlish ? {} : { color: BOY.accentText }}
              >
                My Diary
              </h2>
              <div
                className={`mt-1 h-1 w-12 rounded ${
                  isGirlish ? "bg-pink-300" : ""
                }`}
                style={isGirlish ? {} : { background: BOY.accent }}
              />
            </div>

            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={NAV_OCID[item.id]}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                    activePage === item.id
                      ? isGirlish
                        ? "bg-pink-200 text-pink-700 font-girlish"
                        : "text-white font-boyish"
                      : isGirlish
                        ? "text-pink-500 hover:bg-pink-100 font-girlish"
                        : "font-boyish"
                  }`}
                  style={
                    !isGirlish
                      ? activePage === item.id
                        ? { background: BOY.accent }
                        : { color: BOY.textMuted }
                      : {}
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              type="button"
              data-ocid="diary.lock_button"
              onClick={onLock}
              className={`mt-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isGirlish
                  ? "text-pink-400 hover:bg-pink-100 font-girlish"
                  : "font-boyish uppercase tracking-wider"
              }`}
              style={isGirlish ? {} : { color: BOY.textMuted }}
            >
              <LogOut size={16} />
              Lock Diary
            </button>
          </div>

          {/* Right Page — Content (WHITE for boyish like real paper) */}
          <div
            className={`flex-1 flex flex-col overflow-hidden ${
              isGirlish ? "bg-white" : ""
            }`}
            style={
              isGirlish
                ? { perspective: "1200px" }
                : {
                    background: BOY.pageWhite,
                    perspective: "1200px",
                  }
            }
          >
            <div
              className={`px-6 pt-5 pb-3 border-b ${
                isGirlish ? "border-pink-100" : ""
              }`}
              style={isGirlish ? {} : { borderColor: "#e5e5e5" }}
            >
              <h3
                className={`text-lg font-bold ${
                  isGirlish
                    ? "text-pink-700 font-girlish"
                    : "font-boyish uppercase tracking-widest"
                }`}
                style={isGirlish ? {} : { color: BOY.pageText }}
              >
                {NAV_ITEMS.find((n) => n.id === activePage)?.label}
              </h3>
              <p
                className={`text-xs mt-1 ${isGirlish ? "text-pink-400" : ""}`}
                style={isGirlish ? {} : { color: BOY.textMuted }}
              >
                Click any section on the left to open it fullscreen ↗
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                }}
                className="flex-1 overflow-y-auto p-6"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {fullPageOpen && (
          <FullPageOverlay
            theme={theme}
            activePage={activePage}
            actor={actor}
            onClose={() => setFullPageOpen(false)}
            customPin={customPin}
            onPinChange={onPinChange}
            habits={habits}
            setHabits={setHabits}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState<Theme>("girlish");
  const [appState, setAppState] = useState<AppState>("landing");
  const [customPin, setCustomPin] = useState("1234");
  const { actor } = useActor();

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "girlish" ? "boyish" : "girlish")),
    [],
  );

  const bgStyle =
    theme === "girlish"
      ? {
          background:
            "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #fce4ec 100%)",
        }
      : {
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #050505 100%)",
        };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={bgStyle}>
      <Toaster richColors position="top-center" />
      <FloatingIcons theme={theme} />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <AnimatePresence mode="wait">
        {appState === "landing" && (
          <motion.div key="landing" exit={{ opacity: 0 }}>
            <LandingPage theme={theme} onOpen={() => setAppState("pinlock")} />
          </motion.div>
        )}
        {appState === "pinlock" && (
          <motion.div key="pinlock">
            <PinLock
              theme={theme}
              correctPin={customPin}
              onUnlock={() => setAppState("diary")}
            />
          </motion.div>
        )}
        {appState === "diary" && (
          <motion.div
            key="diary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <DiaryInterface
              theme={theme}
              actor={actor}
              onLock={() => setAppState("pinlock")}
              customPin={customPin}
              onPinChange={setCustomPin}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs opacity-50">
        <span
          style={{
            color: theme === "girlish" ? "#f472b6" : BOY.textMuted,
          }}
        >
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}

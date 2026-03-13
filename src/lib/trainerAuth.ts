// SHA-256 hashing via Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface TrainerSession {
  email: string;
  name: string;
  loggedInAt: string;
}

const SESSION_KEY = "amypo_trainer_session";
const TRAINERS_KEY = "amypo_trainers";

export interface TrainerRecord {
  email: string;
  name: string;
  passwordHash: string;
}

// Seed default trainer on first load
export async function ensureDefaultTrainer() {
  const stored = localStorage.getItem(TRAINERS_KEY);
  if (!stored) {
    const hash = await hashPassword("amypo123");
    const defaults: TrainerRecord[] = [
      { email: "admin@amypo.com", name: "Admin Trainer", passwordHash: hash },
    ];
    localStorage.setItem(TRAINERS_KEY, JSON.stringify(defaults));
  }
}

export function getTrainers(): TrainerRecord[] {
  return JSON.parse(localStorage.getItem(TRAINERS_KEY) || "[]");
}

export async function loginTrainer(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const trainers = getTrainers();
  const trainer = trainers.find((t) => t.email === email);
  if (!trainer) return { success: false, message: "No account found with this email." };
  const hash = await hashPassword(password);
  if (hash !== trainer.passwordHash) return { success: false, message: "Incorrect password." };
  const session: TrainerSession = {
    email: trainer.email,
    name: trainer.name,
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, message: "Logged in successfully." };
}

export async function registerTrainer(
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const trainers = getTrainers();
  if (trainers.find((t) => t.email === email))
    return { success: false, message: "An account with this email already exists." };
  const passwordHash = await hashPassword(password);
  trainers.push({ email, name, passwordHash });
  localStorage.setItem(TRAINERS_KEY, JSON.stringify(trainers));
  return { success: true, message: "Account created." };
}

export function logoutTrainer() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getTrainerSession(): TrainerSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrainerSession;
  } catch {
    return null;
  }
}

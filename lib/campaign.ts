import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

type CampaignDay = {
  done: boolean;
};

type Campaign = {
  weekStart: string; // YYYY-MM-DD (Monday)
  days: Record<number, CampaignDay>;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function mondayOfThisWeek() {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function buildFreshCampaign(): Campaign {
  const days: Record<number, CampaignDay> = {};
  for (let i = 1; i <= 7; i++) {
    days[i] = { done: false };
  }

  return {
    weekStart: mondayOfThisWeek(),
    days,
  };
}

export function getTodayIndex(): number {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun
  if (day === 0) return 7;
  return day;
}

export async function ensureCampaign(uid: string): Promise<Campaign> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data();

  const currentWeek = mondayOfThisWeek();
  let campaign: Campaign | undefined = data?.campaign;

  if (!campaign || campaign.weekStart !== currentWeek) {
    campaign = buildFreshCampaign();
    await updateDoc(ref, { campaign });
  }

  return campaign;
}

export async function completeToday(uid: string): Promise<boolean> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data();

  const currentWeek = mondayOfThisWeek();
  let campaign: Campaign | undefined = data?.campaign;

  if (!campaign || campaign.weekStart !== currentWeek) {
    campaign = buildFreshCampaign();
  }

  const today = getTodayIndex();

  if (campaign.days[today]?.done) {
    return false;
  }

  campaign.days[today] = { done: true };

  await updateDoc(ref, { campaign });

  return true;
}

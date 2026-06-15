import { fetchAPI } from "@/services/api";
import { API } from "./api-routes";
import { toast } from "sonner";

export enum AppIntent {
  PRICING_VIEW = 'PRICING_VIEW',
  INVITE_VILLAGE = 'INVITE_VILLAGE'
}

export const INTENT_KEY = 'mosaic_app_intent';


export const processPendingInvite = async () => {
  try {
    const stored = localStorage.getItem(AppIntent.INVITE_VILLAGE);
    if (stored) {
      const { hash } = JSON.parse(stored);
      if (hash) {
        await fetchAPI(API.INVITES.ACCEPT(hash), {
          method: 'POST'
        });
        localStorage.removeItem(AppIntent.INVITE_VILLAGE);
        localStorage.removeItem(INTENT_KEY);
      }
    }
  } catch (err) {
    console.error('Error processing pending invite:', err);
    toast.error('Failed to process pending invite')
  }
};
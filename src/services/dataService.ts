import { UserData } from '../types';
import axios from 'axios';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth'; 
import { auth } from '../firebase';

const API_BASE = 'http://localhost:5000/api/user';

// LOCAL FALLBACK HELPERS
const getLocalData = (email: string): UserData | null => {
  const data = localStorage.getItem(`dashboard_${email}`);
  return data ? JSON.parse(data) : null;
};
const saveLocalData = (email: string, data: UserData) => {
  localStorage.setItem(`dashboard_${email}`, JSON.stringify(data));
};

export const dataService = {
  getUserData: async (email: string): Promise<UserData | null> => {
    try {
      const response = await axios.get(`${API_BASE}/${email}`);
      if (response.data) {
        saveLocalData(email, response.data); // sync local
        return response.data;
      }
      return getLocalData(email); // fallback
    } catch (error) {
      console.warn("MongoDB fetch failed. Falling back to LocalStorage:", error);
      return getLocalData(email);
    }
  },

  saveUserData: async (email: string, userData: UserData) => {
    saveLocalData(email, userData); // always save locally first for instant UI response
    try {
      await axios.post(`${API_BASE}/${email}`, userData);
    } catch (error) {
      console.warn("MongoDB sync failed. Data is securely saved offline in LocalStorage.");
    }
  },

  updateProfile: async (email: string, updates: { displayName?: string, photoURL?: string }) => {
    console.log("Profile identity updated via Firebase Auth in Dashboard.tsx!");
  },

  addResume: async (email: string) => {
    try {
      const userData = await dataService.getUserData(email);
      if (userData) {
        const resumes = userData.resumes || [];
        resumes.push({
          id: `res-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
        await dataService.saveUserData(email, { ...userData, resumes });
      }
    } catch (error) {
      console.error("Error adding resume:", error);
    }
  },

  updateUserActivity: async (email: string, role: string, checkboxes: Record<string, boolean>) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      const userData = await dataService.getUserData(email);

      if (!userData) {
        const newData: UserData = {
          email,
          default_role: role,
          resumes: [],
          activity: {
            [today]: {
              role,
              checkboxes,
              timestamp
            }
          }
        };
        await dataService.saveUserData(email, newData);
      } else {
        const activity = { ...userData.activity };
        activity[today] = {
          role,
          checkboxes,
          timestamp
        };
        await dataService.saveUserData(email, { ...userData, default_role: role, activity });
      }
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  },

  setDefaultRole: async (email: string, role: string) => {
    try {
      const userData = await dataService.getUserData(email);
      if (userData) {
        await dataService.saveUserData(email, { ...userData, default_role: role });
      } else {
        const newData: UserData = {
          email,
          default_role: role,
          resumes: [],
          activity: {} 
        };
        await dataService.saveUserData(email, newData);
      }
    } catch (error) {
      console.error("Error setting default role:", error);
    }
  }
};

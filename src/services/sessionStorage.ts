import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const SESSION_KEY_PREFIX = "@bountytrack";

const memoryStorage = new Map<string, string>();

function getStorageKey(key: string) {
  return `${SESSION_KEY_PREFIX}:${key}`;
}

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const sessionStorage = {
  getItem: async (key: string) => {
    const storageKey = getStorageKey(key);

    if (Platform.OS === "web") {
      if (canUseBrowserStorage()) {
        return window.localStorage.getItem(storageKey);
      }

      return memoryStorage.get(storageKey) ?? null;
    }

    return AsyncStorage.getItem(storageKey);
  },
  setItem: async (key: string, value: string) => {
    const storageKey = getStorageKey(key);

    if (Platform.OS === "web") {
      if (canUseBrowserStorage()) {
        window.localStorage.setItem(storageKey, value);
        return;
      }

      memoryStorage.set(storageKey, value);
      return;
    }

    await AsyncStorage.setItem(storageKey, value);
  },
  removeItem: async (key: string) => {
    const storageKey = getStorageKey(key);

    if (Platform.OS === "web") {
      if (canUseBrowserStorage()) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      memoryStorage.delete(storageKey);
      return;
    }

    await AsyncStorage.removeItem(storageKey);
  },
};

import { useEffect, useState } from "react";
import { AppLanguage } from "../constants/languages";
import {
  getSelectedLanguage,
  subscribeSelectedLanguage,
} from "../repository/appStateRepository";

export function useSelectedLanguage() {
  const [language, setLanguage] = useState<AppLanguage>(() => getSelectedLanguage());

  useEffect(() => {
    setLanguage(getSelectedLanguage());

    return subscribeSelectedLanguage((nextLanguage) => {
      setLanguage(nextLanguage);
    });
  }, []);

  return language;
}

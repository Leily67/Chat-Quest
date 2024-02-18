// src/utils/userDarkMode.ts

// Fonction pour obtenir le thème actuel
export const getInitialTheme = (): string => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs;
      }
  
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
  
    // Si aucun paramètre n'est trouvé, retournez le mode clair par défaut
    return 'light';
  };
  
  // Fonction pour sauvegarder le thème dans localStorage
  export const setTheme = (theme: string) => {
    window.localStorage.setItem('theme', theme);
  };
  
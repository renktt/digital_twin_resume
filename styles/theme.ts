// styles/theme.ts
export const colors = {
  background: "#F5F5F0",
  accent: "#E6D8C3",
  secondary: "#C2A68C",
  highlight: "#5D866C",
  dark: {
    background: "#1a1a1a",
    accent: "#2a2a2a",
    secondary: "#3a3a3a",
    highlight: "#4a7c59",
  }
};

export const theme = {
  font: "Poppins, sans-serif",
  borderRadius: "1rem",
  transition: "all 0.3s ease",
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  }
};

export type Theme = typeof theme;
export type Colors = typeof colors;

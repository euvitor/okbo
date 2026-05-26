import { createContext, useContext } from "react"
import { useTheme } from "../hooks/useTheme"
import type { ReactNode } from "react"

interface ThemeContextValue {
    theme: "light" | "dark"
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { theme, toggleTheme } = useTheme()

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useThemeContext() {
    const context = useContext(ThemeContext)

    if (!context) throw new Error("useThemeContext must be used within a ThemeProvider")

    return context
}
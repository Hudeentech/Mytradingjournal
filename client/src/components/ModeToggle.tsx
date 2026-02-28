import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider"

export function ModeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else setTheme('light');
        // Simplified toggle for now, skipping 'system' to keep UX simple
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme" className={className}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

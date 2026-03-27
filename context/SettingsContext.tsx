import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark' | 'system';

interface SettingsContextType {
    isVolunteeringMode: boolean;
    setIsVolunteeringMode: (val: boolean) => void;
    isVoiceSOSActive: boolean;
    setIsVoiceSOSActive: (val: boolean) => void;
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    resolvedTheme: 'light' | 'dark';
    karmaPoints: number;
    addKarma: (points: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [isVolunteeringMode, setIsVolunteeringMode] = useState(true);
    const [isVoiceSOSActive, setIsVoiceSOSActive] = useState(true);
    const [theme, setTheme] = useState<ThemeType>('system');
    const [karmaPoints, setKarmaPoints] = useState(1250);

    const deviceColorScheme = useDeviceColorScheme();
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(deviceColorScheme ?? 'light');

    const addKarma = (points: number) => {
        setKarmaPoints(current => current + points);
    };

    useEffect(() => {
        if (theme === 'system') {
            setResolvedTheme(deviceColorScheme ?? 'light');
        } else {
            setResolvedTheme(theme);
        }
    }, [theme, deviceColorScheme]);

    return (
        <SettingsContext.Provider
            value={{
                isVolunteeringMode,
                setIsVolunteeringMode,
                isVoiceSOSActive,
                setIsVoiceSOSActive,
                theme,
                setTheme,
                resolvedTheme,
                karmaPoints,
                addKarma,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

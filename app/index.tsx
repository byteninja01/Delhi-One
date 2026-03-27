import { Redirect } from 'expo-router';
import React from 'react';

export default function LandingScreen() {
    return <Redirect href="/(tabs)/home" />;
}


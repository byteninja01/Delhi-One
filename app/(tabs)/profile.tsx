import { Card, Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, View as RNView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function CitizenIdentity() {
    const { user, logout } = useAuth() as any;
    const { resolvedTheme, setTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to end your protocol session?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'LOGOUT', onPress: logout, style: 'destructive' }
        ]);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
            {/* 1. Identity Card */}
            <Card style={styles.identityCard}>
                <RNView style={styles.idHeader}>
                    <RNView style={[styles.avatar, { backgroundColor: colors.tint + '11' }]}>
                        <MaterialCommunityIcons name="shield-account" size={40} color={colors.tint} />
                    </RNView>
                    <RNView style={styles.idText}>
                        <Text style={styles.name}>{user?.fullName || 'Anonymous Citizen'}</Text>
                        <RNView style={styles.verifiedBadge}>
                            <FontAwesome name="check-circle" size={12} color={colors.success} />
                            <Text style={[styles.verifiedText, { color: colors.success }]}>IDENTITY VERIFIED</Text>
                        </RNView>
                    </RNView>
                </RNView>

                <RNView style={styles.statsRow}>
                    <RNView style={styles.statItem}>
                        <Text style={styles.statLabel}>REPUTATION</Text>
                        <Text style={[styles.statValue, { color: colors.tint }]}>{user?.reputationScore || 100}</Text>
                    </RNView>
                    <RNView style={styles.statDivider} />
                    <RNView style={styles.statItem}>
                        <Text style={styles.statLabel}>VALIDATIONS</Text>
                        <Text style={styles.statValue}>12</Text>
                    </RNView>
                    <RNView style={styles.statDivider} />
                    <RNView style={styles.statItem}>
                        <Text style={styles.statLabel}>RANK</Text>
                        <Text style={styles.statValue}>Silver</Text>
                    </RNView>
                </RNView>
            </Card>

            {/* 2. Participation Sections */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>PARTICIPATION HISTORY</Text>
            </View>

            <TouchableOpacity style={styles.menuItem}>
                <MaterialCommunityIcons name="history" size={20} color={colors.tint} />
                <Text style={styles.menuText}>Ledger Contribution Log</Text>
                <FontAwesome name="chevron-right" size={14} color="#9BA1A6" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color={colors.tint} />
                <Text style={styles.menuText}>Verification Records</Text>
                <FontAwesome name="chevron-right" size={14} color="#9BA1A6" />
            </TouchableOpacity>

            {/* 3. Settings & Privacy */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>PROTOCOL SETTINGS</Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
                <MaterialCommunityIcons name="theme-light-dark" size={20} color={colors.tint} />
                <Text style={styles.menuText}>Appearance ({resolvedTheme === 'light' ? 'Light' : 'Dark'})</Text>
                <MaterialCommunityIcons name="swap-horizontal" size={20} color="#9BA1A6" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <MaterialCommunityIcons name="fingerprint" size={20} color={colors.tint} />
                <Text style={styles.menuText}>Biometric Authentication</Text>
                <MaterialCommunityIcons name="toggle-switch-off" size={20} color="#9BA1A6" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <MaterialCommunityIcons name="database-eye-off" size={20} color={colors.tint} />
                <Text style={styles.menuText}>Data Privacy & Consent</Text>
                <FontAwesome name="chevron-right" size={14} color="#9BA1A6" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { marginTop: 24 }]} onPress={handleLogout}>
                <MaterialCommunityIcons name="logout" size={20} color={colors.notification} />
                <Text style={[styles.menuText, { color: colors.notification }]}>Logout Session</Text>
            </TouchableOpacity>

            {/* 4. Footer */}
            <RNView style={styles.footer}>
                <Text style={styles.footerText}>Made by Ujjwal · github.com/byteninja01</Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://github.com/byteninja01')}>
                    <FontAwesome name="github" size={20} color="#9BA1A6" style={{ marginTop: 12 }} />
                </TouchableOpacity>
                <Text style={styles.version}>Suraksha+ Build 1.0.42_2026-02-09</Text>
            </RNView>

            <RNView style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    identityCard: {
        padding: 24,
        borderRadius: 20,
        marginBottom: 30,
    },
    idHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    idText: {
        backgroundColor: 'transparent',
    },
    name: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 4,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: '900',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E3E7',
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '900',
        opacity: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '900',
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#E0E3E7',
    },
    sectionHeader: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
        opacity: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 18,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E3E7',
    },
    menuText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 16,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '700',
        opacity: 0.4,
    },
    version: {
        fontSize: 9,
        opacity: 0.2,
        marginTop: 20,
        fontFamily: 'SpaceMono',
    },
});

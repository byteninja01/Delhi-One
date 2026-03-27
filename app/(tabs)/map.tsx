import { Card, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Linking, Text as RNText, View as RNView, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

const FILTERS = ['All', 'Infrastructure', 'Waste', 'Water', 'Safety'];
const STATUS_COLORS = {
    VALIDATED: '#FF9500', // Warning Orange
    ASSIGNED: '#007AFF', // Action Blue
    RESOLVED: '#34C759', // Success Green
    DELAYED: '#FF3B30',  // Breach Red
    ESCALATED: '#5856D6', // System Purple
};

export default function AwarenessLedger() {
    const colorScheme = useColorScheme() ?? 'light';
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const { token } = useAuth() as any;

    const [selectedFact, setSelectedFact] = useState<any>(null);

    // Mock Fleet/Awareness Data
    const fleetData = [
        { id: 'u1', type: 'REPORT', title: 'Pothole: USAR College', lat: '45%', lng: '55%', status: 'VALIDATED', severity: 'High' },
        { id: 'u2', type: 'REPORT', title: 'Hazard: Karkardooma Court', lat: '35%', lng: '42%', status: 'ASSIGNED', severity: 'Medium' },
        { id: 'v1', type: 'UNIT', title: 'Response Unit 09 (Police)', lat: '40%', lng: '50%', status: 'MOVING' },
        { id: 'v2', type: 'UNIT', title: 'Response Unit 14 (Ambulance)', lat: '60%', lng: '30%', status: 'IDLE' },
        { id: 'v3', type: 'UNIT', title: 'Citizen Responder (Vol)', lat: '25%', lng: '65%', status: 'ACTIVE' },
    ];

    useEffect(() => {
        setSelectedFact(fleetData[0]);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 1. Fleet Map Interface */}
            <RNView style={[styles.mapMock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Background Grid Pattern for Tech Look */}
                <RNView style={styles.gridOverlay} />

                <RNText style={styles.mapLabel}>SURAKSHA+ AWARENESS GRID - REGION 07 (DELHI-EAST)</RNText>

                {fleetData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.marker,
                            { left: item.lng as any, top: item.lat as any }
                        ]}
                        onPress={() => setSelectedFact(item)}
                    >
                        {item.type === 'REPORT' ? (
                            <RNView style={styles.reportMarker}>
                                <FontAwesome
                                    name="circle"
                                    size={16}
                                    color={item.status === 'VALIDATED' ? colors.success : colors.tint}
                                />
                                {selectedFact?.id === item.id && <RNView style={[styles.markerRing, { borderColor: colors.notification }]} />}
                            </RNView>
                        ) : (
                            <RNView style={styles.unitMarker}>
                                <MaterialCommunityIcons
                                    name={item.title.includes('Police') ? "car" : item.title.includes('Ambulance') ? "medical-bag" : "account"}
                                    size={20}
                                    color={item.status === 'MOVING' ? colors.tint : colors.success}
                                />
                                {item.status === 'MOVING' && <RNView style={styles.movingPulse} />}
                            </RNView>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Region Circles for Visual Depth */}
                <RNView style={[styles.regionCircle, { width: 400, height: 400, opacity: 0.05, borderColor: colors.tint }]} />
                <RNView style={[styles.regionCircle, { width: 200, height: 200, opacity: 0.1, borderColor: colors.tint }]} />
            </RNView>

            {/* 2. Detail Intelligence Panel */}
            <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
                {selectedFact ? (
                    <Card style={styles.detailCard}>
                        <RNView style={styles.detailHeader}>
                            <RNView style={[styles.statusTag, { backgroundColor: colors.tint + '22' }]}>
                                <RNText style={[styles.statusText, { color: colors.tint }]}>{selectedFact.type === 'UNIT' ? 'FLEET UNIT' : 'CIVIC FACT'}</RNText>
                            </RNView>
                            <RNText style={styles.timestamp}>ACTIVE PROTOCOL</RNText>
                        </RNView>

                        <RNText style={styles.factTitle}>{selectedFact.title}</RNText>

                        {selectedFact.type === 'REPORT' ? (
                            <RNView>
                                <RNText style={styles.factDesc}>
                                    Verified civic hazard at {selectedFact.title.includes('USAR') ? 'Vivek Vihar' : 'Karkardooma'}.
                                    Integrity validated by 100+ local citizens.
                                </RNText>
                                <RNView style={styles.impactRow}>
                                    <RNView style={styles.impactItem}>
                                        <FontAwesome name="warning" size={12} color={colors.notification} />
                                        <RNText style={styles.impactLabel}>Severity: {selectedFact.severity}</RNText>
                                    </RNView>
                                    <RNView style={styles.impactItem}>
                                        <FontAwesome name="check-circle" size={12} color={colors.success} />
                                        <RNText style={styles.impactLabel}>Truth: 98.4%</RNText>
                                    </RNView>
                                </RNView>
                            </RNView>
                        ) : (
                            <RNView>
                                <RNText style={styles.factDesc}>
                                    Live tracking {selectedFact.title}. Status: {selectedFact.status}.
                                    Ensuring accountability and rapid response in the grid.
                                </RNText>
                                <RNView style={styles.impactRow}>
                                    <RNView style={styles.impactItem}>
                                        <MaterialCommunityIcons name="broadcast" size={12} color={colors.tint} />
                                        <RNText style={styles.impactLabel}>Signal: Cryptographic-Secure</RNText>
                                    </RNView>
                                </RNView>
                            </RNView>
                        )}

                        <TouchableOpacity style={[styles.viewAllButton, { borderColor: colors.border }]}>
                            <RNText style={[styles.viewAllText, { color: colors.tint }]}>VIEW FULL AUDIT LOG</RNText>
                        </TouchableOpacity>
                    </Card>
                ) : (
                    <RNText style={styles.emptyText}>Initialize sensor grid to view civic intelligence.</RNText>
                )}

                <RNView style={styles.legendContainer}>
                    <RNText style={styles.legendTitle}>GRID LEGEND</RNText>
                    <RNView style={styles.legendRow}>
                        <RNView style={[styles.legendDot, { backgroundColor: colors.success }]} /><RNText style={styles.legendText}>Validated Reports</RNText>
                        <RNView style={[styles.legendDot, { backgroundColor: colors.tint, marginLeft: 16 }]} /><RNText style={styles.legendText}>Response Units</RNText>
                    </RNView>
                </RNView>

                <RNView style={styles.footer}>
                    <RNText style={styles.footerText}>Made by Ujjwal · github.com/byteninja01</RNText>
                    <TouchableOpacity onPress={() => Linking.openURL('https://github.com/byteninja01')}>
                        <FontAwesome name="github" size={18} color="#9BA1A6" style={{ marginTop: 8 }} />
                    </TouchableOpacity>
                    <RNText style={styles.protocolText}>Suraksha+ Protocol v1.0.42 (BETA)</RNText>
                </RNView>

                <RNView style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapMock: {
        height: '50%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        overflow: 'hidden',
    },
    gridOverlay: {
        position: 'absolute',
        width: '200%',
        height: '200%',
        opacity: 0.05,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#9BA1A6',
        transform: [{ scale: 10 }], // Create a grid effect
    },
    mapLabel: {
        position: 'absolute',
        top: 16,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        opacity: 0.3,
    },
    marker: {
        position: 'absolute',
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    reportMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    unitMarker: {
        backgroundColor: '#FFF',
        padding: 6,
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    markerRing: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
    },
    movingPulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#339AF0',
        opacity: 0.3,
    },
    regionCircle: {
        position: 'absolute',
        borderRadius: 1000,
        borderWidth: 1,
    },
    detailContainer: {
        flex: 1,
        padding: 16,
    },
    detailCard: {
        padding: 20,
        borderRadius: 24,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    timestamp: {
        fontSize: 10,
        opacity: 0.4,
        fontWeight: '800',
    },
    factTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 8,
    },
    factDesc: {
        fontSize: 13,
        lineHeight: 20,
        opacity: 0.6,
        marginBottom: 16,
    },
    impactRow: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    impactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        backgroundColor: 'transparent',
    },
    impactLabel: {
        fontSize: 11,
        fontWeight: '800',
        opacity: 0.7,
        marginLeft: 6,
    },
    viewAllButton: {
        borderWidth: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    legendContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: 'transparent',
    },
    legendTitle: {
        fontSize: 10,
        fontWeight: '900',
        opacity: 0.4,
        marginBottom: 12,
        letterSpacing: 1,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        fontWeight: '700',
        opacity: 0.6,
        marginLeft: 6,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        opacity: 0.4,
        fontSize: 13,
    },
    footer: {
        marginTop: 40,
        paddingVertical: 20,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E0E3E7',
        backgroundColor: 'transparent',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '700',
        opacity: 0.5,
        letterSpacing: 0.5,
    },
    protocolText: {
        fontSize: 9,
        opacity: 0.3,
        marginTop: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
});

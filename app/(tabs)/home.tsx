import { Card, Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Linking, View as RNView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
    const { user, token } = useAuth() as any;
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const router = useRouter();

    const [stats, setStats] = useState({
        resolved: 142,
        active: 28,
        reputation: user?.reputation || 0,
    });

    const quotes = [
        "Transformation of the nation requires collective accountability.",
        "Doing the right thing is visible, recorded, and respected.",
        "Your participation is the foundation of institutional truth.",
    ];
    const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

    const [newsCategory, setNewsCategory] = useState<'SOCIETY' | 'CITY' | 'STATE'>('SOCIETY');
    const [selectedNews, setSelectedNews] = useState<any>(null);

    const newsData = {
        SOCIETY: [
            {
                id: 's1',
                title: 'Society Security Upgrade',
                desc: 'CCTV installation completed in Block C & D to enhance resident safety.',
                content: 'Following last month\'s board meeting, the community has successfully installed 16 new high-definition CCTV cameras in Block C and D. This completes the first phase of our "Secure Society" initiative.',
                image: 'https://images.unsplash.com/photo-1557597774-9d2739f05a76?q=80&w=500&auto=format&fit=crop',
                date: 'Today',
            },
            {
                id: 's2',
                title: 'Water Tank Cleaning',
                desc: 'Scheduled cleaning for all overhead tanks this weekend.',
                content: 'Routine maintenance and professional cleaning of all water reservoirs will take place on Saturday from 9 AM to 5 PM. Residents are advised to store sufficient water for domestic use.',
                image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=500&auto=format&fit=crop',
                date: 'Yesterday',
            }
        ],
        CITY: [
            {
                id: 'c1',
                title: 'Metro Phase 4 Updates',
                desc: 'New station blueprints approved for Karkardooma extension.',
                content: 'The DMRC has officially approved the final blueprints for the Karkardooma interchange station under Phase 4. This will significantly reduce travel time for residents of East Delhi.',
                image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=500&auto=format&fit=crop',
                date: '2 hours ago',
            },
            {
                id: 'c2',
                title: 'PAN Card Distribution Camp',
                desc: 'Special drive at City Center for new card applications.',
                content: 'A three-day special drive for PAN card distribution and new applications has been launched at the City Center Mall. Officials will be present from 10 AM to 6 PM to assist citizens.',
                image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop',
                date: '5 hours ago',
            }
        ],
        STATE: [
            {
                id: 'st1',
                title: 'New Social Security Scheme',
                desc: 'State government announces insurance for gig workers.',
                content: 'In a landmark decision, the State Cabinet has approved a new social security framework that provides health and accident insurance to over 2 lakh gig workers across the state.',
                image: 'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?q=80&w=500&auto=format&fit=crop',
                date: '1 day ago',
            }
        ]
    };

    const NewsModal = () => (
        selectedNews && (
            <RNView style={styles.modalOverlay}>
                <Card style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedNews(null)}>
                        <FontAwesome name="times" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Image source={{ uri: selectedNews.image }} style={styles.modalImage} />
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <Text style={styles.modalTitle}>{selectedNews.title}</Text>
                        <Text style={styles.modalDate}>{selectedNews.date}</Text>
                        <Text style={styles.modalBody}>{selectedNews.content}</Text>
                    </ScrollView>
                </Card>
            </RNView>
        )
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
            {/* 1. Header & Weather/Quote */}
            <View style={styles.header}>
                <RNView>
                    <Text style={styles.greeting}>Jai Hind, {user?.fullName?.split(' ')[0] || 'Citizen'}</Text>
                    <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                </RNView>
                <RNView style={styles.weatherCard}>
                    <FontAwesome name="sun-o" size={16} color={colors.tint} />
                    <Text style={[styles.weatherText, { color: colors.tint }]}>24°C • New Delhi</Text>
                </RNView>
            </View>

            <Card style={styles.quoteCard}>
                <FontAwesome name="quote-left" size={12} color={colors.tint} style={{ opacity: 0.3 }} />
                <Text style={styles.quoteText}>{quote}</Text>
            </Card>

            {/* 2. Impact Dashboard */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>CIVIC FOOTPRINT</Text>
            </View>

            <RNView style={styles.statsGrid}>
                <Card style={styles.statBox}>
                    <Text style={[styles.statValue, { color: colors.success }]}>{stats.resolved}</Text>
                    <Text style={styles.statLabel}>Resolved Near You</Text>
                </Card>
                <Card style={styles.statBox}>
                    <Text style={[styles.statValue, { color: colors.notification }]}>{stats.active}</Text>
                    <Text style={styles.statLabel}>Active Allegations</Text>
                </Card>
                <Card style={styles.statBox}>
                    <Text style={[styles.statValue, { color: colors.tint }]}>{user?.reputationScore || 100}</Text>
                    <Text style={styles.statLabel}>Citizen Score</Text>
                </Card>
            </RNView>

            {/* 3. News Feed Area */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>LOCATION NEWS FEED</Text>
            </View>

            <RNView style={styles.newsTabs}>
                {(['SOCIETY', 'CITY', 'STATE'] as const).map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setNewsCategory(cat)}
                        style={[styles.newsTabBtn, newsCategory === cat && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
                    >
                        <Text style={[styles.newsTabText, { color: newsCategory === cat ? colors.tint : colors.text, opacity: newsCategory === cat ? 1 : 0.5 }]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </RNView>

            {newsData[newsCategory].map(item => (
                <Card key={item.id} style={styles.newsItemCard}>
                    <RNView style={styles.newsItemContent}>
                        <RNView style={{ flex: 1 }}>
                            <Text style={styles.newsItemTitle}>{item.title}</Text>
                            <Text style={styles.newsItemDesc}>{item.desc}</Text>
                            <TouchableOpacity onPress={() => setSelectedNews(item)} style={styles.readMoreBtn}>
                                <Text style={[styles.readMoreText, { color: colors.tint }]}>Read more →</Text>
                            </TouchableOpacity>
                        </RNView>
                        <Image source={{ uri: item.image }} style={styles.newsThumbnail} />
                    </RNView>
                </Card>
            ))}

            {/* 4. Action Hub */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>PROTOCOL ACTIONS</Text>
            </View>

            <TouchableOpacity onPress={() => router.push('/(tabs)/report')} style={styles.actionCard}>
                <RNView style={[styles.actionIcon, { backgroundColor: colors.tint + '11' }]}>
                    <MaterialCommunityIcons name="file-document-edit-outline" size={24} color={colors.tint} />
                </RNView>
                <RNView style={styles.actionTextContent}>
                    <Text style={styles.actionTitle}>Report Civic Failure</Text>
                    <Text style={styles.actionDesc}>Inscribe an issue on the immutable ledger.</Text>
                </RNView>
                <FontAwesome name="chevron-right" size={14} color="#9BA1A6" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(tabs)/map')} style={styles.actionCard}>
                <RNView style={[styles.actionIcon, { backgroundColor: colors.success + '11' }]}>
                    <MaterialCommunityIcons name="map-marker-radius" size={24} color={colors.success} />
                </RNView>
                <RNView style={styles.actionTextContent}>
                    <Text style={styles.actionTitle}>Awareness Map</Text>
                    <Text style={styles.actionDesc}>View verified truth markers in your area.</Text>
                </RNView>
                <FontAwesome name="chevron-right" size={14} color="#9BA1A6" />
            </TouchableOpacity>

            <NewsModal />

            {/* 5. Footer (Trust Pillar) */}
            <RNView style={styles.footer}>
                <Text style={styles.footerText}>Made by Ujjwal · github.com/byteninja01</Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://github.com/byteninja01')}>
                    <FontAwesome name="github" size={18} color="#9BA1A6" style={{ marginTop: 8 }} />
                </TouchableOpacity>
                <Text style={styles.protocolText}>Suraksha+ Protocol v1.0.42 (BETA)</Text>
            </RNView>

            <RNView style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    greeting: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    date: {
        fontSize: 12,
        opacity: 0.6,
        fontWeight: '600',
    },
    weatherCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#002D6211',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    weatherText: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 6,
    },
    quoteCard: {
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 3,
        borderLeftColor: '#002D62',
    },
    quoteText: {
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 20,
        opacity: 0.8,
    },
    sectionHeader: {
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
        opacity: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    statBox: {
        flex: 0.31,
        alignItems: 'center',
        paddingVertical: 16,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 9,
        textAlign: 'center',
        fontWeight: '700',
        opacity: 0.6,
    },
    newsTabs: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    newsTabBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    newsTabText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    newsItemCard: {
        padding: 12,
        marginBottom: 12,
        borderRadius: 12,
    },
    newsItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    newsThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 12,
    },
    newsItemTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    newsItemDesc: {
        fontSize: 12,
        opacity: 0.6,
        lineHeight: 18,
    },
    readMoreBtn: {
        marginTop: 8,
    },
    readMoreText: {
        fontSize: 11,
        fontWeight: '900',
    },
    modalOverlay: {
        position: 'absolute',
        top: -100, // Cover the screen properly
        bottom: -100,
        left: -100,
        right: -100,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '70%',
        borderRadius: 24,
        overflow: 'hidden',
        padding: 0,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: 200,
    },
    modalScroll: {
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 8,
    },
    modalDate: {
        fontSize: 12,
        opacity: 0.5,
        fontWeight: '700',
        marginBottom: 16,
    },
    modalBody: {
        fontSize: 15,
        lineHeight: 24,
        opacity: 0.8,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E3E7',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionTextContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    actionDesc: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 2,
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

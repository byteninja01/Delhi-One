import { apiClient } from '@/api/client';
import { Card, Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, View as RNView, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const CATEGORIES = [
  { id: 'INFRA', name: 'Roads & Infrastructure', icon: 'road' },
  { id: 'WASTE', name: 'Sanitation & Waste', icon: 'trash' },
  { id: 'WATER', name: 'Water & Sewage', icon: 'water' },
  { id: 'POWER', name: 'Electricity & Lighting', icon: 'bolt' },
  { id: 'SAFETY', name: 'Public Safety', icon: 'shield' },
];

export default function ReportScreen() {
  const { token } = useAuth() as any;
  const { resolvedTheme } = useSettings();
  const colors = Colors[resolvedTheme];

  const [activeTab, setActiveTab] = useState<'REPORT' | 'FEED'>('REPORT');
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for Reported Feed
  const [mockFeed, setMockFeed] = useState([
    {
      id: '1',
      author: 'Citizen_42',
      category: 'Road',
      title: 'Major Pothole near USAR College',
      location: 'Vivek Vihar, Near USAR College Gate',
      votes: 124,
      verifications: 16,
      status: 'VALIDATED',
      timestamp: '2 hours ago',
      timeline: [
        { status: 'Reported', date: '2026-02-10 08:30', hash: '0x8a2...3f1', completed: true },
        { status: 'Validated', date: '2026-02-10 09:45', hash: '0x4c9...7b2', completed: true },
        { status: 'Assigned', date: 'Pending', hash: 'N/A', completed: false },
      ],
    },
    {
      id: '2',
      author: 'Lawyer_Delhi',
      category: 'Infrastructure',
      title: 'Hazardous Road near Karkardooma Court',
      location: 'Surajmal Vihar, Karkardooma Court Circle',
      votes: 89,
      verifications: 8,
      status: 'ASSIGNED',
      timestamp: '5 hours ago',
      timeline: [
        { status: 'Reported', date: '2026-02-10 05:15', hash: '0x1e5...9a4', completed: true },
        { status: 'Validated', date: '2026-02-10 06:20', hash: '0x7d2...2c8', completed: true },
        { status: 'Assigned', date: '2026-02-10 07:00', hash: '0x9f1...4e3', completed: true },
        { status: 'Resolved', date: 'Pending', hash: 'N/A', completed: false },
      ],
    },
    {
      id: '3',
      author: 'Gov_Official_Verified',
      category: 'Electricity',
      title: 'Faulty Streetlights in Block B',
      location: 'Vivek Vihar, Phase II',
      votes: 210,
      verifications: 34,
      status: 'RESOLVED',
      timestamp: 'Yesterday',
      timeline: [
        { status: 'Reported', date: '2026-02-09 10:00', hash: '0x2a1...bb4', completed: true },
        { status: 'Validated', date: '2026-02-09 11:30', hash: '0x5e3...cc1', completed: true },
        { status: 'Resolved', date: '2026-02-09 17:45', hash: '0x0d9...88f', completed: true },
      ],
    },
  ]);

  const handleVote = (id: string, type: 'UP' | 'DOWN') => {
    setMockFeed(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, votes: type === 'UP' ? item.votes + 1 : item.votes - 1 };
      }
      return item;
    }));
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (description.length < 15) {
      Alert.alert('Details Required', 'Please provide a more specific description (min 15 characters).');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient('/feed', {
        method: 'POST',
        token,
        body: JSON.stringify({
          content: `${selectedCategory}: ${description}`,
          latitude: 28.6675, // USAR Area approx
          longitude: 77.2945,
        }),
      });
      Alert.alert('Inscribed', 'Report written to ledger. Verification phase starting.');
      setStep(1);
      setSelectedCategory(null);
      setDescription('');
      setActiveTab('FEED');
    } catch (error: any) {
      Alert.alert('Protocol Error', error.error || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>SURAKSHA+ LEDGER</Text>
        <RNView style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('REPORT')}
            style={[styles.tab, activeTab === 'REPORT' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'REPORT' ? colors.tint : colors.text, opacity: activeTab === 'REPORT' ? 1 : 0.5 }]}>REPORT ISSUE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('FEED')}
            style={[styles.tab, activeTab === 'FEED' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'FEED' ? colors.tint : colors.text, opacity: activeTab === 'FEED' ? 1 : 0.5 }]}>REPORTED FEED</Text>
          </TouchableOpacity>
        </RNView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'REPORT' ? (
          <RNView>
            <Text style={styles.stepIndicator}>Step {step} of 3</Text>
            {step === 1 && (
              <RNView>
                <Text style={styles.label}>SELECT CATEGORY</Text>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      selectedCategory === cat.id && { borderColor: colors.tint, borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <RNView style={[styles.iconBox, { backgroundColor: colors.tint + '11' }]}>
                      <FontAwesome name={cat.icon as any} size={20} color={colors.tint} />
                    </RNView>
                    <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                    {selectedCategory === cat.id && <FontAwesome name="check-circle" size={18} color={colors.tint} />}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: colors.tint, opacity: selectedCategory ? 1 : 0.5 }]}
                  disabled={!selectedCategory}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.nextText}>CONTINUE TO DETAILS</Text>
                </TouchableOpacity>
              </RNView>
            )}

            {step === 2 && (
              <RNView>
                <Text style={styles.label}>SITUATION DESCRIPTION</Text>
                <Card style={styles.inputBox}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Describe the institutional failure..."
                    placeholderTextColor="#9BA1A6"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    autoFocus
                  />
                </Card>
                <RNView style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={() => setStep(1)}>
                    <Text style={[styles.backText, { color: colors.text }]}>BACK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.nextButton, { flex: 1, backgroundColor: colors.tint, marginLeft: 12, opacity: description.length >= 15 ? 1 : 0.5 }]}
                    disabled={description.length < 15}
                    onPress={() => setStep(3)}
                  >
                    <Text style={styles.nextText}>VERIFY LOCATION</Text>
                  </TouchableOpacity>
                </RNView>
              </RNView>
            )}

            {step === 3 && (
              <RNView>
                <Text style={styles.label}>FINAL VERIFICATION</Text>
                <Card style={styles.finalCard}>
                  <RNView style={styles.infoRow}>
                    <FontAwesome name="map-marker" size={16} color={colors.tint} />
                    <Text style={styles.infoText}>USAR College Area detected</Text>
                  </RNView>
                </Card>
                <RNView style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={() => setStep(2)}>
                    <Text style={[styles.backText, { color: colors.text }]}>BACK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, { flex: 1, marginLeft: 12, backgroundColor: colors.tint }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>SUBMIT TO LEDGER</Text>}
                  </TouchableOpacity>
                </RNView>
              </RNView>
            )}
          </RNView>
        ) : (
          <RNView>
            <RNView style={styles.feedSummary}>
              <Text style={styles.label}>NEARBY CIVIC REPORTS</Text>
              <Text style={styles.verificationSummary}>Verified by Citizens: 100%</Text>
            </RNView>
            {mockFeed.map((item) => (
              <Card key={item.id} style={styles.feedCard}>
                <RNView style={styles.feedHeader}>
                  <RNView>
                    <Text style={styles.categoryTag}>Issue about: {item.category}</Text>
                    <Text style={styles.feedTitle}>{item.title}</Text>
                  </RNView>
                  <RNView style={[styles.statusBadge, { backgroundColor: item.status === 'RESOLVED' ? colors.success : item.status === 'VALIDATED' ? colors.success + '22' : colors.tint + '22' }]}>
                    <Text style={[styles.statusBadgeText, { color: item.status === 'RESOLVED' ? '#FFF' : item.status === 'VALIDATED' ? colors.success : colors.tint }]}>{item.status}</Text>
                  </RNView>
                </RNView>

                <RNView style={styles.locationRow}>
                  <FontAwesome name="map-marker" size={12} color="#9BA1A6" />
                  <Text style={styles.locationText}>{item.location}</Text>
                </RNView>

                <RNView style={styles.verificationRow}>
                  <FontAwesome name="check-circle" size={12} color={colors.success} />
                  <Text style={styles.verificationText}>{item.verifications} citizens verified it</Text>
                </RNView>

                {expandedId === item.id ? (
                  <RNView style={styles.timelineContainer}>
                    <Text style={styles.ledgerTitle}>AUDIT LOGS & PROOFS</Text>
                    {item.timeline.map((t, idx) => (
                      <RNView key={idx} style={styles.timelineItem}>
                        <RNView style={[styles.timelineDot, { backgroundColor: t.completed ? colors.success : '#9BA1A633' }]} />
                        <RNView style={styles.timelineContent}>
                          <RNView style={styles.timelineHeader}>
                            <Text style={[styles.timelineStatus, { opacity: t.completed ? 1 : 0.4 }]}>{t.status}</Text>
                            <Text style={styles.timelineHash}>{t.hash}</Text>
                          </RNView>
                          <Text style={styles.timelineDate}>{t.date}</Text>
                        </RNView>
                      </RNView>
                    ))}
                  </RNView>
                ) : null}

                <RNView style={styles.voteRow}>
                  <RNView style={styles.voteControls}>
                    <TouchableOpacity onPress={() => handleVote(item.id, 'UP')} style={styles.voteBtn}>
                      <FontAwesome name="caret-up" size={24} color={colors.success} />
                    </TouchableOpacity>
                    <Text style={styles.voteCount}>{item.votes}</Text>
                    <TouchableOpacity onPress={() => handleVote(item.id, 'DOWN')} style={styles.voteBtn}>
                      <FontAwesome name="caret-down" size={24} color={colors.notification} />
                    </TouchableOpacity>
                  </RNView>
                  <TouchableOpacity
                    style={styles.commentBtn}
                    onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <FontAwesome name={expandedId === item.id ? "chevron-up" : "history"} size={16} color={colors.tint} />
                    <Text style={[styles.commentText, { color: colors.tint }]}>{expandedId === item.id ? 'Close Details' : 'Verify details'}</Text>
                  </TouchableOpacity>
                </RNView>
              </Card>
            ))}
          </RNView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.5,
    textAlign: 'right',
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 16,
    opacity: 0.5,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  nextText: {
    color: '#FFF',
    fontWeight: '900',
    letterSpacing: 1,
  },
  inputBox: {
    padding: 16,
    minHeight: 120,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    width: 90,
  },
  backText: {
    fontWeight: '800',
  },
  finalCard: {
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
    opacity: 0.8,
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFF',
    fontWeight: '900',
    letterSpacing: 1,
  },
  feedCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.5,
    fontWeight: '700',
  },
  feedTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
  locationText: {
    fontSize: 11,
    color: '#9BA1A6',
    marginLeft: 6,
    fontWeight: '600',
  },
  timelineContainer: {
    borderLeftWidth: 1,
    borderLeftColor: '#9BA1A633',
    marginLeft: 4,
    paddingLeft: 16,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: -20,
  },
  timelineContent: {
    backgroundColor: 'transparent',
  },
  timelineStatus: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timelineDate: {
    fontSize: 9,
    opacity: 0.4,
    marginTop: 2,
  },
  voteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#9BA1A611',
    backgroundColor: 'transparent',
  },
  voteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  voteBtn: {
    paddingHorizontal: 10,
  },
  voteCount: {
    fontSize: 13,
    fontWeight: '900',
    minWidth: 30,
    textAlign: 'center',
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  commentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9BA1A6',
    marginLeft: 6,
  },
  feedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  verificationSummary: {
    fontSize: 10,
    fontWeight: '800',
    color: '#51CF66',
    letterSpacing: 0.5,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9BA1A6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  verificationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#51CF66',
    marginLeft: 6,
  },
  ledgerTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.4,
    marginBottom: 12,
    marginTop: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  timelineHash: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    opacity: 0.4,
    backgroundColor: '#002D6211',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

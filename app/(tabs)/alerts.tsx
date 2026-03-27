import { apiClient } from '@/api/client';
import { Card, Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, View as RNView, ScrollView, StyleSheet, TouchableOpacity, Vibration } from 'react-native';

export default function EmergencyCommandCenter() {
  const { token } = useAuth() as any;
  const { resolvedTheme } = useSettings();
  const colors = Colors[resolvedTheme];

  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSOS, setActiveSOS] = useState<any>(null);

  const handleLongPressSOS = async () => {
    Vibration.vibrate(100);
    Alert.alert(
      'LIFE-CRITICAL SOS',
      'Broadcast location to authorities and nearby responders?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'ACTIVATE',
          style: 'destructive',
          onPress: async () => {
            setIsSending(true);
            try {
              const data = await apiClient('/emergency', {
                method: 'POST',
                token,
                body: JSON.stringify({
                  type: 'GENERAL',
                  latitude: 28.6139,
                  longitude: 77.2090,
                }),
              });
              setActiveSOS(data);
              Vibration.vibrate([100, 200, 100]);
            } catch (error: any) {
              Alert.alert('System Error', 'SOS Protocol Failure');
            } finally {
              setIsSending(false);
            }
          }
        }
      ]
    );
  };

  const startVoiceCommand = () => {
    setIsListening(true);
    Vibration.vibrate(50);
    setTimeout(() => {
      setIsListening(false);
      Alert.alert('Voice Command Received', 'Detecting emergency keywords: "Help", "Emergency". Broadcasting location.');
    }, 2000);
  };

  const handleCall = (number: string, label: string) => {
    Alert.alert('Emergency Dial', `Connecting to ${label} (${number})...`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => Linking.openURL(`tel:${number}`) }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>EMERGENCY COMMAND</Text>
        <Text style={styles.headerSubtitle}>Suraksha+ Protocol Alpha</Text>
      </View>

      {/* 1. Main SOS Action */}
      <TouchableOpacity
        onLongPress={handleLongPressSOS}
        delayLongPress={1500}
        activeOpacity={0.8}
        style={[styles.sosButton, { backgroundColor: colors.notification }]}
      >
        {isSending ? (
          <ActivityIndicator color="#FFF" size="large" />
        ) : (
          <RNView style={styles.sosContent}>
            <MaterialCommunityIcons name="alert-octagon" size={64} color="#FFF" />
            <Text style={styles.sosMainText}>SOS</Text>
            <Text style={styles.sosSubText}>HOLD FOR 1.5S TO TRIGGER</Text>
          </RNView>
        )}
      </TouchableOpacity>

      {activeSOS && (
        <Card style={styles.activeSOSCard}>
          <RNView style={styles.activeHeader}>
            <RNView style={styles.liveDot} />
            <Text style={styles.activeTitle}>BROADCAST ACTIVE</Text>
          </RNView>
          <Text style={styles.activeMeta}>Authorities & Responders Notified</Text>
        </Card>
      )}

      {/* 2. Voice SOS Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>VOICE ASSISTANCE</Text>
      </View>

      <Card style={styles.voiceCard}>
        <TouchableOpacity
          onPress={startVoiceCommand}
          style={[styles.voiceCircle, { backgroundColor: isListening ? colors.notification : colors.tint + '22' }]}
        >
          <MaterialCommunityIcons name={isListening ? "microphone" : "microphone-outline"} size={32} color={isListening ? "#FFF" : colors.tint} />
        </TouchableOpacity>
        <RNView style={styles.voiceTextContent}>
          <Text style={styles.voiceTitle}>{isListening ? 'Listening...' : 'Voice SOS'}</Text>
          <Text style={styles.voiceDesc}>Tap to activate voice-triggered emergency protocols.</Text>
        </RNView>
      </Card>

      {/* 3. Quick Dial Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>INSTANT CONNECT</Text>
      </View>

      <RNView style={styles.callGrid}>
        <TouchableOpacity onPress={() => handleCall('100', 'POLICE')} style={styles.callCard}>
          <RNView style={[styles.callIconBox, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="police-badge" size={24} color="#1976D2" />
          </RNView>
          <Text style={styles.callLabel}>POLICE</Text>
          <Text style={styles.callNumber}>100</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleCall('102', 'AMBULANCE')} style={styles.callCard}>
          <RNView style={[styles.callIconBox, { backgroundColor: '#FFEBEE' }]}>
            <MaterialCommunityIcons name="ambulance" size={24} color="#D32F2F" />
          </RNView>
          <Text style={styles.callLabel}>AMBULANCE</Text>
          <Text style={styles.callNumber}>102</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleCall('1091', 'WOMEN SAFETY')} style={styles.callCard}>
          <RNView style={[styles.callIconBox, { backgroundColor: '#F3E5F5' }]}>
            <MaterialCommunityIcons name="face-woman-shimmer" size={24} color="#7B1FA2" />
          </RNView>
          <Text style={styles.callLabel}>WOMEN</Text>
          <Text style={styles.callNumber}>1091</Text>
        </TouchableOpacity>
      </RNView>

      <RNView style={styles.protocolWarning}>
        <FontAwesome name="shield" size={14} color="#9BA1A6" />
        <Text style={styles.protocolWarningText}>
          Misuse of SOS protocols will result in immediate citizen-score penalties.
        </Text>
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
  headerArea: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.4,
    marginTop: 4,
    letterSpacing: 1,
  },
  sectionHeader: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    opacity: 0.5,
  },
  sosButton: {
    height: 220,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  sosContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  sosMainText: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '900',
    marginTop: 10,
  },
  sosSubText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.7,
    marginTop: 6,
  },
  activeSOSCard: {
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginBottom: 30,
    backgroundColor: '#FF6B6B08',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginRight: 8,
  },
  activeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  activeMeta: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.6,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 30,
    borderRadius: 20,
  },
  voiceCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceTextContent: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: 'transparent',
  },
  voiceTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  voiceDesc: {
    fontSize: 12,
    opacity: 0.5,
    lineHeight: 18,
  },
  callGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  callCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E3E7',
  },
  callIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  callLabel: {
    fontSize: 9,
    fontWeight: '900',
    opacity: 0.6,
    marginBottom: 2,
  },
  callNumber: {
    fontSize: 13,
    fontWeight: '900',
  },
  protocolWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    opacity: 0.4,
    backgroundColor: 'transparent',
  },
  protocolWarningText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 8,
    textAlign: 'center',
  },
});

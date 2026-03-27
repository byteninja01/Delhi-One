import { apiClient } from '@/api/client';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View as DefaultView, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface SignUpFormData {
    fullName: string;
    email: string;
    password: string;
    idType: 'AADHAAR' | 'PAN';
    idNumber: string;
    residency: string;
    origin: string;
    society: string;
    college: string;
}

export default function SignupScreen() {
    const [formData, setFormData] = useState<SignUpFormData>({
        fullName: '',
        email: '',
        password: '',
        idType: 'AADHAAR', // AADHAAR or PAN
        idNumber: '',
        residency: '',
        origin: '',
        society: '',
        college: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const updateField = (field: keyof SignUpFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSignup = async () => {
        if (!formData.email || !formData.password || !formData.fullName || !formData.idNumber) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const data = await apiClient('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            await login(data.token, data.user);
            router.replace('/(tabs)/home');
        } catch (error: any) {
            alert(Array.isArray(error.error) ? error.error[0].message : (error.error || 'Signup failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the Delhi AI Civic Network</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <InputItem
                        icon="user"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChangeText={(v: string) => updateField('fullName', v)}
                    />
                    <InputItem
                        icon="envelope"
                        placeholder="Email Address"
                        value={formData.email}
                        onChangeText={(v: string) => updateField('email', v)}
                        autoCapitalize="none"
                    />
                    <InputItem
                        icon="lock"
                        placeholder="Password"
                        value={formData.password}
                        onChangeText={(v: string) => updateField('password', v)}
                        secureTextEntry
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Identity Verification</Text>
                    <DefaultView style={styles.idSelector}>
                        <TouchableOpacity
                            style={[styles.idButton, formData.idType === 'AADHAAR' && styles.idButtonActive]}
                            onPress={() => updateField('idType', 'AADHAAR')}
                        >
                            <Text style={[styles.idButtonText, formData.idType === 'AADHAAR' && styles.idButtonTextActive]}>AADHAAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.idButton, formData.idType === 'PAN' && styles.idButtonActive]}
                            onPress={() => updateField('idType', 'PAN')}
                        >
                            <Text style={[styles.idButtonText, formData.idType === 'PAN' && styles.idButtonTextActive]}>PAN CARD</Text>
                        </TouchableOpacity>
                    </DefaultView>
                    <InputItem
                        icon="vcard"
                        placeholder={formData.idType === 'AADHAAR' ? "Aadhaar Number (12-digit)" : "PAN Number"}
                        value={formData.idNumber}
                        onChangeText={(v: string) => updateField('idNumber', v)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Residency & Associations</Text>
                    <InputItem
                        icon="home"
                        placeholder="Where do you live? (Current Area)"
                        value={formData.residency}
                        onChangeText={(v: string) => updateField('residency', v)}
                    />
                    <InputItem
                        icon="map-marker"
                        placeholder="Where do you belong? (Hometown)"
                        value={formData.origin}
                        onChangeText={(v: string) => updateField('origin', v)}
                    />
                    <InputItem
                        icon="building"
                        placeholder="Associated Society/RWA"
                        value={formData.society}
                        onChangeText={(v: string) => updateField('society', v)}
                    />
                    <InputItem
                        icon="graduation-cap"
                        placeholder="College/University (if student)"
                        value={formData.college}
                        onChangeText={(v: string) => updateField('college', v)}
                    />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
                    <Text style={styles.submitButtonText}>REGISTER</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Link href="/auth/login" asChild>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function InputItem({ icon, ...props }: any) {
    return (
        <View style={styles.inputContainer}>
            <FontAwesome name={icon} size={18} color="#003366" style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholderTextColor="#999"
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        padding: 25,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#003366',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    section: {
        marginBottom: 25,
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        marginLeft: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 12,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: '#EEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 15,
        width: 25,
        textAlign: 'center',
    },
    input: {
        flex: 1,
        color: '#333',
        fontSize: 16,
    },
    idSelector: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 10,
    },
    idButton: {
        flex: 1,
        height: 45,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#003366',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    idButtonActive: {
        backgroundColor: '#003366',
    },
    idButtonText: {
        color: '#003366',
        fontWeight: 'bold',
    },
    idButtonTextActive: {
        color: '#FFF',
    },
    submitButton: {
        backgroundColor: '#003366',
        height: 60,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 40,
        backgroundColor: 'transparent',
    },
    footerText: {
        color: '#666',
        fontSize: 15,
    },
    linkText: {
        color: '#FF8C00',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Themed';

export function SOSButton({ onPress }: { onPress: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.3)).current;
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 0.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        pulse.start();
        return () => pulse.stop();
    }, []);

    const handlePressIn = () => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                onPress();
                Animated.timing(progress, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            }
        });
    };

    const handlePressOut = () => {
        progress.stopAnimation();
        Animated.timing(progress, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.pulse,
                    {
                        transform: [{ scale }],
                        opacity,
                    },
                ]}
            />
            <TouchableOpacity
                style={styles.button}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <Text style={styles.text}>SOS</Text>
                <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </TouchableOpacity>
            <Text style={styles.hint}>Hold for 2 seconds</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 200,
    },
    pulse: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#FF3B30',
    },
    button: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#FF3B30',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    text: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
    },
    progressBar: {
        position: 'absolute',
        bottom: 0,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 3,
    },
    hint: {
        fontSize: 10,
        fontWeight: '900',
        marginTop: 10,
        opacity: 0.5,
        color: '#FF3B30',
        textTransform: 'uppercase',
    },
});

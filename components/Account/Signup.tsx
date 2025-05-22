import { Alert } from "react-native";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import TextButton from "../TextButton/TextButton";
import { Input } from "@rneui/themed";
import { router } from "expo-router";

export default function Signup() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert(error.message);
        } else if (session) {
            // Create profile after successful signup
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: session.user.id,
                        username: generateUsername(email),
                        avatar_url: null,
                        c_post: 0,
                        c_followers: 0,
                        c_following: 0
                    }
                ]);

            if (profileError) {
                Alert.alert('Error creating profile:', profileError.message);
            } else {
                router.replace('/(tabs)' as any);
            }
        } else {
            Alert.alert('Please check your inbox for email verification!');
        }
        setLoading(false);
    }

    function generateUsername(email: string): string {
        let base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        if (base.length < 4) {
            base = base + Math.random().toString(36).substring(2, 6 - base.length);
        }
        return base;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input
                    label="Email"
                    leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize={'none'}
                />
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Password"
                    leftIcon={{ type: 'font-awesome', name: 'lock' }}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize={'none'}
                />
            </View>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <PrimaryButton
                    text="Sign Up"
                    onClick={signUpWithEmail}
                    disabled={loading}
                />
            </View>

            <View style={styles.verticallySpaced}>
                <TextButton
                    content="Already have an account?"
                    text="Log In"
                    onClick={() => router.push('/(auth)/login')}
                    disabled={loading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F2E6',
        padding: 16,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 100,
        color: '#000000',
    },
    subtitle: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 0,
        color: '#000000',
    },
});

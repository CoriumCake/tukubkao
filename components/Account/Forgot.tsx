import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import { Input } from "@rneui/themed";

export default function Forgot() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleForgotPassword() {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "tukubkao://reset-password",
        });

        if (error) {
            Alert.alert(error.message);
        } else {
            Alert.alert(
                "Success",
                "Please check your email for password reset instructions"
            );
            router.back();
        }

        setLoading(false);
    }

    return (
        <View style={styles.container}>

        <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
                label="Email"
                leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="email@address.com"
                autoCapitalize={"none"}
            />
            <PrimaryButton
                text={loading ? "Loading" : "Reset Password"}
                onClick={handleForgotPassword}
                disabled={loading}
            />
            </View>
        </View>
    );
}

            const styles = StyleSheet.create({
                container: {
                marginTop: 40,
                backgroundColor: '#F8F2E6',
            padding: 12,
  },
            verticallySpaced: {
                paddingTop: 4,
            paddingBottom: 4,
            alignSelf: "stretch",
  },
            mt20: {
                marginTop: 20,
  },
});

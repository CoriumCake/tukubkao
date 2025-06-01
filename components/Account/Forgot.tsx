import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View, StyleSheet, Text } from "react-native";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import { Input } from "@rneui/themed";
import Fonts from "@/constants/Fonts";
import Colors from "@/constants/Colors";

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
      <Text style={styles.title}>Forgot Password</Text>

      <View style={styles.formContainer}>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Your Email "
          autoCapitalize="none"
          inputStyle={{ fontFamily: Fonts.yR, paddingLeft: 8 }}
          labelStyle={{ fontFamily: Fonts.yR, marginBottom: 6 }}
          containerStyle={{ marginBottom: 20, paddingHorizontal: 0 }}
          inputContainerStyle={{
            borderBottomWidth: 1,
            borderBottomColor: Colors.text,
          }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          text={loading ? "Loading..." : "Reset Password"}
          onClick={handleForgotPassword}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EDE8DC",
        paddingHorizontal: 20,
        paddingTop: 100, 
        paddingBottom: 40, 
    },
    title: {
        fontSize: 42,
        fontFamily: Fonts.yB,
        color: Colors.text,
        textAlign: "center",
        marginBottom: 90,
    },
    formContainer: {
        flex: 1, 
        justifyContent: "flex-start",
        paddingHorizontal: 10,
    },
    buttonContainer: {
    paddingHorizontal: 10,
    marginBottom: 315, 
    },
});

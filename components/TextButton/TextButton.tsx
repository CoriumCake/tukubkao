import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './TextButtonStyles';
import Fonts from '@/constants/Fonts';
import { TextStyle } from 'react-native';

export interface TextButtonProps {
  content?: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  isBold?: boolean;
  textStyle?: React.CSSProperties | TextStyle; // Add this line
  contentStyle?: React.CSSProperties | TextStyle; // Add this line if needed
}

const TextButton: React.FC<TextButtonProps> = ({
    content,
    text,
    onClick,
    disabled,
    isBold = false
}) => {
    return (
        <View style={styles.container}>
            {/* ข้อความฝั่งซ้าย */}
            {content !== '' && (
                <Text style={[styles.contentText, { fontFamily: Fonts.yR }]}>{content} </Text>
            )}

            {/* ปุ่ม */}
            <TouchableOpacity
                onPress={onClick}
                style={styles.buttonContainer}
                disabled={disabled}
            >
                {/* ข้อความปุ่ม */}
                <Text style={[
                    styles.text,
                    { fontFamily: isBold ? Fonts.yB : Fonts.yR }
                ]}>
                    {text}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default TextButton;
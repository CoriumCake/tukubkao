import React from 'react';
import { View, TouchableOpacity, Text, TextStyle } from 'react-native';
import { styles } from './TextButtonStyles';

interface TextButtonProps {
    content: string; /* ข้อความฝั่งขวา */
    text: React.ReactNode; /* ข้อความในปุ่ม */
    onClick: () => void; /* ฟังก์ชันที่เรียกเมื่อกดปุ่ม */
    disabled?: boolean; /* กำหนดให้ปุ่มกดได้หรือกดไม้ได้ */
    isBold?: boolean; /* เปิดปิดตัวหนาของข้อความในปุ่ม */
    textStyle?: object
}

const TextButton: React.FC<TextButtonProps> = ({ content, text, onClick, disabled, isBold=false }) => {
    
    return (
        <View style={styles.container}>

            {/*ข้อความฝั่งซ้าย*/}
            <Text style={styles.contentText}>{content}</Text>

            {/*ปุ่ม*/}
            <TouchableOpacity onPress={onClick} style={styles.buttonContainer} disabled={disabled}>
            
            {/*ข้อความปุ่ม*/} 
                <Text style={[styles.text, isBold && styles.boldText]}>{text}</Text>

            </TouchableOpacity>

        </View>
    );
};

export default TextButton;
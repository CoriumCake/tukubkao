import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './PrimaryButtonStyles';

interface PrimaryButtonProps {
    text: string; /* ข้อความในปุ่ม */
    onClick: () => void; /* ฟังก์ชันที่เรียกเมื่อกดปุ่ม */
    disabled?: boolean; /* กำหนดให้ปุ่มกดได้หรือกดไม้ได้ */
    isBold?: boolean; /* เปิดปิดตัวหนาของข้อความในปุ่ม */
    backgroundColor?: string; /* กำหนดสีพื้นหลังของปุ่ม */
}

/*วิธีใช้ <PrimaryButton text="" onClick={} disabled={} isBold={} backgroundColor=""/> */

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ text, onClick, disabled, isBold=false,backgroundColor }) => {
    
    return (
        <View style={styles.container}>
            {/*ปุ่ม*/}
            <TouchableOpacity 
            onPress={onClick} 
            disabled={disabled}
            style={[
                styles.buttonContainer,
                disabled && styles.disabledButton,
                { backgroundColor: backgroundColor || '#A5B68D' },
              ]}
            >
            
            {/*ข้อความปุ่ม*/} 
                <Text style={[styles.text, isBold && styles.boldText]}>{text}</Text>

            </TouchableOpacity>

        </View>
    );
};

export default PrimaryButton;
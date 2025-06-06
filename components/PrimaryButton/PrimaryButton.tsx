import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './PrimaryButtonStyles';

interface PrimaryButtonProps {
    text: string; /* ข้อความในปุ่ม */
    onClick: () => void; /* ฟังก์ชันที่เรียกเมื่อกดปุ่ม */
    disabled?: boolean; /* กำหนดให้ปุ่มกดได้หรือกดไม้ได้ */
    isBold?: boolean; /* เปิดปิดตัวหนาของข้อความในปุ่ม */
    backgroundColor?: string; /* กำหนดสีพื้นหลังของปุ่ม */
    borderColor?: string;     /* เพิ่ม prop สำหรับขอบปุ่ม */
    textColor?: string;       /* เพิ่ม prop สำหรับสีข้อความ */
}

/*วิธีใช้ <PrimaryButton text="" onClick={} disabled={} isBold={} backgroundColor="" borderColor="" textColor=""/> */

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  onClick,
  disabled,
  isBold = false,
  backgroundColor,
  borderColor,
  textColor,
}) => {
  return (
    <View style={styles.container}>
      {/* ปุ่ม */}
      <TouchableOpacity
        onPress={onClick}
        disabled={disabled}
        style={[
          styles.buttonContainer,
          disabled && styles.disabledButton,
          {
            backgroundColor: backgroundColor || '#A5B68D',
            borderColor: borderColor || 'transparent',
            borderWidth: borderColor ? 1 : 0,
          },
        ]}
      >
        {/* ข้อความปุ่ม */}
        <Text
          style={[
            styles.text,
            isBold && styles.boldText,
            { color: textColor || '#FFFFFF' },
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PrimaryButton;

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface GenerateButtonProps {
  onPress: () => void;
  isGenerating: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onPress,
  isGenerating,
}) => {
  return (
    <TouchableOpacity 
      style={styles.generateButton}
      onPress={onPress}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.generateButtonText}>Generate Recipes</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  generateButton: {
    backgroundColor: '#A5B68D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
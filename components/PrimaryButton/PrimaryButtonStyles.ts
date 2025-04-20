import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 15,
        gap: 5,
        justifyContent: 'center',

    },
    buttonContainer: {
        backgroundColor: "#A5B68D",
        alignItems: 'center',
        marginTop: 0,
        padding: 12,
        width: '100%',
        borderRadius: 8,
    },
    text: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
    },
    boldText: {
        fontWeight: 'bold',
    },
    contentText: {
        fontSize: 16,
    },
    disabledButton: {
      opacity: 0.5,
    },
});
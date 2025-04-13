import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        gap: 5,
        justifyContent: 'center',
    },
    buttonContainer: {
        alignSelf: 'center',
    },
    text: {
        color: '#000000',
        textAlign: 'center',
        fontSize: 16,
    },
    boldText: {
        fontWeight: 'bold',
    },
    contentText: {
        fontSize: 16,
    }
});
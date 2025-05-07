import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const PostCard = ({ username, image, caption }: { username: string; image: string; caption: string }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.username}>{username}</Text>
      <View style={styles.imageContainer}>
      {/* <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> */}
      {/* ใช้ชั่วคราวตอนทำ UI */}
      <Image source={typeof image === 'string' ? { uri: image } : image}
              style={styles.image}
              resizeMode="cover"
      />
      </View>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 0.5,
    elevation: 4,
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 0,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    padding: 12,
    paddingLeft: 22,
    paddingBottom: 6,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#D9D9D9',
  },
  caption: {
    fontSize: 14,
    color: '#555',
    padding: 12,
    paddingTop: 12,
    paddingLeft: 22,
  },
});

export default PostCard;

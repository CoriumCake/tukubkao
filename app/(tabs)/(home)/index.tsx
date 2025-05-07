import { View, Text, Image, FlatList, ScrollView, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import PostCard from '@/components/PostCard/PostCard';
import SearchBar from '@/components/SearchBar/SearchBar';
import { useState } from 'react';

const posts = [
 {
   id: '1',
   username: 'เฟิน',
   image: require('../../../assets/images/food1.jpg'),
   caption: 'มื้อเที่ยงของเราวันนี้ 🍱',
 },
 {
   id: '2',
   username: 'rin_chan',
   image: 'https://via.placeholder.com/300',
   caption: 'เหลือข้าวเยอะเลยทำเป็นข้าวผัดซะเลย!',
 },
 {
  id: '3',
  username: 'rin_chan',
  image: 'https://via.placeholder.com/300',
  caption: 'เหลือข้าวเยอะเลยทำเป็นข้าวผัดซะเลย!',
},
{
  id: '4',
  username: 'rin_chan',
  image: 'https://via.placeholder.com/300',
  caption: 'เหลือข้าวเยอะเลยทำเป็นข้าวผัดซะเลย!',
},
 
];

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
 return (
   <SafeAreaView style={styles.safeArea}>
     <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.searchBarContainer}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="search..." />
          </View>
        }
        renderItem={({ item }) => (
          <PostCard username={item.username} image={item.image} caption={item.caption} />
        )}
      />
   </SafeAreaView>
 );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#F8F2E6',

  },
  content: {
    padding: 16,
  },
  searchBarContainer: {
    marginBottom: 16,
    
  }
});
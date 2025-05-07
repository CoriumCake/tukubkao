import { View, Text, Image, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const posts = [
 {
   id: '1',
   username: 'เฟิน',
   image: 'https://via.placeholder.com/300',
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
 return (
   <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <ScrollView>
     <FlatList
       data={posts}
       keyExtractor={(item) => item.id}
       contentContainerStyle={{ padding: 16 }}
       showsVerticalScrollIndicator={false}
       renderItem={({ item }) => (
         <View style={{
           marginBottom: 24,
           backgroundColor: '#f9f9f9',
           padding: 12,
           borderRadius: 12,
           shadowColor: '#000',
           shadowOffset: { width: 0, height: 2 },
           shadowOpacity: 0.1,
           shadowRadius: 4,
           elevation: 2
         }}>
           <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{item.username}</Text>
           <Image
             source={{ uri: item.image }}
             style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 8 }}
             resizeMode="cover"
           />
           <Text style={{ fontSize: 14, color: '#333' }}>{item.caption}</Text>
         </View>
       )}
     />
     </ScrollView>
   </SafeAreaView>
 );
}

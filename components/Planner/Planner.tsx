import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AntDesign } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DayObject {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface DayComponentProps {
  date?: DayObject;
  state?: 'disabled' | 'today' | '';
}

interface Recipe {
  id: string;
  title: string;
  recipe_desc?: string;
  ingred: string[];
}

interface PlanNote {
  note: string;
  recipes: Recipe[];
}

interface PlanType {
  [date: string]: PlanNote;
}

const STORAGE_KEY = '@planner_data';

export default function PlannerScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [note, setNote] = useState('');
  const [plans, setPlans] = useState<PlanType>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    loadPlans();
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, recipe_desc, ingred');
      
      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const storedPlans = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const savePlans = async (newPlans: PlanType) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
    } catch (error) {
      console.error('Error saving plans:', error);
    }
  };

  const onDayPress = (day: DayObject) => {
    setSelectedDate(day.dateString);
    if (plans[day.dateString]) {
      setNote(plans[day.dateString].note);
      setSelectedRecipes(plans[day.dateString].recipes);
    } else {
      setNote('');
      setSelectedRecipes([]);
    }
    setModalVisible(true);
  };

  const handleSavePlan = async () => {
    if (selectedDate) {
      const newPlans = {
        ...plans,
        [selectedDate]: {
          note,
          recipes: selectedRecipes
        }
      };
      setPlans(newPlans);
      await savePlans(newPlans);
      setModalVisible(false);
    }
  };

  const toggleRecipeSelection = (recipe: Recipe) => {
    setSelectedRecipes(prev => {
      const isSelected = prev.some(r => r.id === recipe.id);
      if (isSelected) {
        return prev.filter(r => r.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    // Mark dates with plans
    Object.keys(plans).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: '#A5B68D'
      };
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] || {}),
        selected: true,
        selectedColor: '#A5B68D',
      };
    }

    return marked;
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#2d4150',
          selectedDayBackgroundColor: '#A5B68D',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#A5B68D',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#A5B68D',
          selectedDotColor: '#ffffff',
          arrowColor: '#A5B68D',
          monthTextColor: '#2d4150',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14
        }}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          setSelectedDate(new Date().toISOString().split('T')[0]);
          setNote('');
          setSelectedRecipes([]);
          setModalVisible(true);
        }}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เพิ่มแผน</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <Text style={styles.selectedDateText}>
              วันที่: {selectedDate}
            </Text>

            <Text style={styles.sectionTitle}>เมนูที่เลือก:</Text>
            <ScrollView style={styles.recipeList}>
              {recipes.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={[
                    styles.recipeItem,
                    selectedRecipes.some(r => r.id === recipe.id) && styles.selectedRecipe
                  ]}
                  onPress={() => toggleRecipeSelection(recipe)}
                >
                  <Text style={styles.recipeName}>{recipe.title}</Text>
                  {selectedRecipes.some(r => r.id === recipe.id) && (
                    <AntDesign name="check" size={20} color="#A5B68D" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>หมายเหตุ:</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="เพิ่มหมายเหตุ..."
              value={note}
              onChangeText={setNote}
              multiline
            />

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSavePlan}
            >
              <Text style={styles.saveButtonText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A5B68D',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d4150',
  },
  selectedDateText: {
    fontSize: 16,
    color: '#2d4150',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 10,
  },
  recipeList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8,
  },
  selectedRecipe: {
    backgroundColor: '#f0f4ed',
    borderColor: '#A5B68D',
  },
  recipeName: {
    fontSize: 16,
    color: '#2d4150',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    minHeight: 80,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#A5B68D',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
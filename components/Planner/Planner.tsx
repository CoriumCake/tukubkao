import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface DayObject {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface Recipe {
  id: string;
  title: string;
  recipe_desc?: string;
  ingred?: string[];
  category?: string;
}

type MealType = 'breakfast' | 'lunch' | 'dinner';

interface DayPlan {
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
}

interface PlanType {
  [date: string]: DayPlan;
}

export default function PlannerScreen() {
  const { session } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [plans, setPlans] = useState<PlanType>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [mealSelectorVisible, setMealSelectorVisible] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      loadPlans();
      fetchRecipes();
    }
  }, [session]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, recipe_desc');
      
      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const loadPlans = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('planner')
        .select(`
          date,
          meal,
          recipes:recipe_id (
            id,
            title,
            recipe_desc,
            ingred
          )
        `)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Transform the data into our PlanType structure
      const plansMap: PlanType = {};
      data?.forEach((plan: any) => {
        if (!plansMap[plan.date]) {
          plansMap[plan.date] = {};
        }
        const recipe: Recipe = {
          id: plan.recipes.id,
          title: plan.recipes.title,
          recipe_desc: plan.recipes.recipe_desc,
          ingred: plan.recipes.ingred || [],
          category: plan.recipes.category,
        };
        plansMap[plan.date][plan.meal as MealType] = recipe;
      });
      setPlans(plansMap);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const savePlan = async () => {
    if (!selectedDate || !session?.user || !selectedRecipe || !selectedMeal) return;
    setLoading(true);
    try {
      // First delete any existing plan for this date and meal
      const { error: deleteError } = await supabase
        .from('planner')
        .delete()
        .eq('user_id', session.user.id)
        .eq('date', selectedDate)
        .eq('meal', selectedMeal);

      if (deleteError) throw deleteError;

      // Then insert the new plan
      const { error: insertError } = await supabase
        .from('planner')
        .insert([{
          user_id: session.user.id,
          date: selectedDate,
          meal: selectedMeal,
          recipe_id: selectedRecipe.id
        }]);

      if (insertError) throw insertError;

      // Update local state
      const newPlans = {
        ...plans,
        [selectedDate]: {
          ...plans[selectedDate],
          [selectedMeal]: selectedRecipe
        }
      };
      setPlans(newPlans);
      setModalVisible(false);
      Alert.alert('Success', 'Plan saved successfully!');
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    // Mark dates with plans
    Object.entries(plans).forEach(([date, plan]) => {
      if (Object.keys(plan).length > 0) {
        marked[date] = {
          marked: true,
          dotColor: '#A5B68D'
        };
      }
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

  const handleAddMeal = (meal: MealType) => {
    setSelectedMeal(meal);
    setMealSelectorVisible(false);
    setIsEditing(false);
    setSelectedRecipe(null);
    setModalVisible(true);
  };

  const handleEditMeal = (date: string, meal: MealType, recipe: Recipe | undefined) => {
    if (!recipe) return;
    setSelectedDate(date);
    setSelectedMeal(meal);
    setSelectedRecipe(recipe);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteMeal = async (date: string, meal: MealType) => {
    if (!session?.user) return;

    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบรายการนี้ใช่หรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel'
        },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('planner')
                .delete()
                .eq('user_id', session.user.id)
                .eq('date', date)
                .eq('meal', meal);

              if (error) throw error;

              // Update local state
              const newPlans = { ...plans };
              if (newPlans[date]) {
                delete newPlans[date][meal];
                if (Object.keys(newPlans[date]).length === 0) {
                  delete newPlans[date];
                }
              }
              setPlans(newPlans);
              Alert.alert('สำเร็จ', 'ลบรายการเรียบร้อยแล้ว');
            } catch (error) {
              console.error('Error deleting plan:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบรายการได้');
            }
          }
        }
      ]
    );
  };

  // Get unique categories from recipes
  const categories = [...new Set(recipes.map(recipe => recipe.category || '').filter(Boolean))];

  // Filter recipes based on search and category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || (recipe.category || '') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DayObject) => setSelectedDate(day.dateString)}
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

      {/* Display current day's plan */}
      {selectedDate && (
        <View style={styles.dayPlanContainer}>
          <Text style={styles.dayPlanTitle}>แผนวันที่ {selectedDate}</Text>
          <View style={styles.mealsList}>
            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => (
              <View key={meal} style={styles.mealItem}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealType}>
                    {meal === 'breakfast' ? 'เช้า' : meal === 'lunch' ? 'กลางวัน' : 'เย็น'}:
                  </Text>
                  <Text style={styles.recipeName}>
                    {plans[selectedDate]?.[meal]?.title || '-'}
                  </Text>
                </View>
                {plans[selectedDate]?.[meal] && (
                  <View style={styles.mealActions}>
                    <TouchableOpacity
                      onPress={() => handleEditMeal(selectedDate, meal, plans[selectedDate][meal])}
                      style={styles.actionButton}
                    >
                      <AntDesign name="edit" size={20} color="#A5B68D" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteMeal(selectedDate, meal)}
                      style={styles.actionButton}
                    >
                      <AntDesign name="delete" size={20} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          if (!selectedDate) {
            setSelectedDate(new Date().toISOString().split('T')[0]);
          }
          setMealSelectorVisible(true);
        }}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Meal Type Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={mealSelectorVisible}
        onRequestClose={() => setMealSelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, styles.mealSelectorModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เลือกมื้ออาหาร</Text>
              <Pressable onPress={() => setMealSelectorVisible(false)}>
                <AntDesign name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <View style={styles.mealButtonsContainer}>
              <TouchableOpacity
                style={styles.mealButton}
                onPress={() => handleAddMeal('breakfast')}
              >
                <AntDesign name="calendar" size={24} color="#A5B68D" />
                <Text style={styles.mealButtonText}>มื้อเช้า</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mealButton}
                onPress={() => handleAddMeal('lunch')}
              >
                <AntDesign name="clockcircle" size={24} color="#A5B68D" />
                <Text style={styles.mealButtonText}>มื้อกลางวัน</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mealButton}
                onPress={() => handleAddMeal('dinner')}
              >
                <AntDesign name="home" size={24} color="#A5B68D" />
                <Text style={styles.mealButtonText}>มื้อเย็น</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recipe Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, styles.recipeModalView]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'แก้ไขเมนู' : 'เพิ่มเมนู'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <Text style={styles.selectedDateText}>
              วันที่: {selectedDate}
            </Text>

            <Text style={styles.selectedMealText}>
              มื้อ: {selectedMeal === 'breakfast' ? 'เช้า' : selectedMeal === 'lunch' ? 'กลางวัน' : 'เย็น'}
            </Text>

            {/* Search bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="ค้นหาเมนู..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <AntDesign name="close" size={16} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {/* Categories */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !selectedCategory && styles.selectedCategoryChip
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  styles.categoryText,
                  !selectedCategory && styles.selectedCategoryText
                ]}>ทั้งหมด</Text>
              </TouchableOpacity>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.selectedCategoryChip
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Recipe list */}
            <ScrollView style={styles.recipeList}>
              {filteredRecipes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>ไม่พบเมนูที่ค้นหา</Text>
                </View>
              ) : (
                filteredRecipes.map(recipe => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[
                      styles.recipeItem,
                      selectedRecipe?.id === recipe.id && styles.selectedRecipe
                    ]}
                    onPress={() => setSelectedRecipe(recipe)}
                  >
                    <View style={styles.recipeItemContent}>
                      <Text style={styles.recipeName}>{recipe.title}</Text>
                      {recipe.recipe_desc && (
                        <Text style={styles.recipeDesc} numberOfLines={1}>
                          {recipe.recipe_desc}
                        </Text>
                      )}
                    </View>
                    {selectedRecipe?.id === recipe.id && (
                      <AntDesign name="check" size={20} color="#A5B68D" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={savePlan}
              disabled={loading || !selectedRecipe}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'กำลังบันทึก...' : isEditing ? 'อัปเดต' : 'บันทึก'}
              </Text>
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
  dayPlanContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dayPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d4150',
  },
  mealsList: {
    gap: 8,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  mealType: {
    width: 80,
    fontSize: 14,
    color: '#666',
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
  selectedMealText: {
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
  saveButton: {
    backgroundColor: '#A5B68D',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealSelectorModal: {
    width: '80%',
    maxHeight: '40%',
  },
  mealButtonsContainer: {
    marginTop: 20,
    gap: 16,
  },
  mealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mealButtonText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#2d4150',
    fontWeight: '500',
  },
  recipeModalView: {
    width: '95%',
    maxHeight: '90%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#2d4150',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    flexGrow: 0,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategoryChip: {
    backgroundColor: '#A5B68D',
    borderColor: '#A5B68D',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  recipeItemContent: {
    flex: 1,
  },
  recipeDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
}); 
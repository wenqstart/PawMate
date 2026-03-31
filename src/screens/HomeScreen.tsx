import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from '../theme';
import { Pet } from '../types';
import { getPets, savePets } from '../utils/storage';
import { mockPets } from '../data/mockData';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [pets, setPets] = useState<Pet[]>([]);

  // 使用 useFocusEffect 在页面获得焦点时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  const loadPets = async () => {
    let storedPets = await getPets();
    if (storedPets.length === 0) {
      await savePets(mockPets);
      storedPets = mockPets;
    }
    setPets(storedPets);
  };

  const calculateAge = (birthday: string) => {
    const birth = new Date(birthday);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (years === 0) {
      return `${months}个月`;
    } else if (months < 0) {
      return `${years - 1}岁${12 + months}个月`;
    } else {
      return `${years}岁${months}个月`;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeCard}
      >
        <Text style={styles.welcomeTitle}>欢迎来到PawMate！</Text>
        <Text style={styles.welcomeSubtitle}>
          管理你的宠物，记录美好时光，寻找合适的伴侣
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🐾</Text>
            <Text style={styles.statText}>{pets.length} 只宠物</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>💝</Text>
            <Text style={styles.statText}>待匹配</Text>
          </View>
        </View>
      </LinearGradient>

      {/* My Pets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="paw" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>我的宠物</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddPet')}>
            <Text style={styles.addButton}>添加宠物</Text>
          </TouchableOpacity>
        </View>

        {pets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>还没有添加宠物</Text>
            <TouchableOpacity
              style={styles.addPetButton}
              onPress={() => navigation.navigate('AddPet')}
            >
              <Text style={styles.addPetButtonText}>添加第一只宠物</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {pets.slice(0, 2).map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
              >
                <Image source={{ uri: pet.avatar }} style={styles.petAvatar} />
                <View style={styles.petInfo}>
                  <View style={styles.petHeader}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petGenderIcon}>
                      {pet.gender === 'male' ? '🦁' : '🌸'}
                    </Text>
                  </View>
                  <Text style={styles.petBreed}>
                    {pet.breed} · {calculateAge(pet.birthday)}
                  </Text>
                  <View style={styles.personalityContainer}>
                    {pet.personality.slice(0, 3).map((trait, index) => (
                      <View key={index} style={styles.personalityTag}>
                        <Text style={styles.personalityText}>{trait}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Ionicons name="heart" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
            {pets.length > 2 && (
              <TouchableOpacity style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>查看更多 ({pets.length - 2})</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFE9DC' }]}
            onPress={() => navigation.navigate('Dating')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="heart" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionLabel}>宠物相亲</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFF4E0' }]}
            onPress={() => navigation.navigate('Expenses')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary }]}>
              <Ionicons name="wallet" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionLabel}>记账</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#E8F5E9' }]}
            onPress={() => navigation.navigate('Memories')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.success }]}>
              <Ionicons name="calendar" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionLabel}>纪念日</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFE0CC' }]}
            onPress={() => navigation.navigate('AddPet')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryDark }]}>
              <Ionicons name="add" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionLabel}>添加宠物</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statEmoji: {
    fontSize: FONT_SIZE.xl,
  },
  statText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginVertical: SPACING.md,
  },
  addPetButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  addPetButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petAvatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
  },
  petInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  petName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  petGenderIcon: {
    fontSize: FONT_SIZE.md,
  },
  petBreed: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  personalityTag: {
    backgroundColor: '#FFE9DC',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  personalityText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: (width - SPACING.md * 3) / 2,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  showMoreText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

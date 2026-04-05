import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet } from '../firebase/auth';
import { getUserPets } from '../firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

const ACTION_CARDS: { key: string; icon: string; color: string; screen: string; translationKey: string }[] = [
  { key: 'dating', icon: 'heart', color: '#C4A484', screen: 'Dating', translationKey: 'datingAction' },
  { key: 'expenses', icon: 'wallet', color: '#5C7A99', screen: 'Expenses', translationKey: 'expensesAction' },
  { key: 'memories', icon: 'calendar', color: '#4A7C59', screen: 'Memories', translationKey: 'memoriesAction' },
  { key: 'addPet', icon: 'add-circle', color: '#1A1A1A', screen: 'AddPet', translationKey: 'addPetAction' },
];

export default function HomeScreen({ navigation }: any) {
  const { user, userProfile } = useAuth();
  const { t } = useI18n();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPets = useCallback(async () => {
    if (!user) {
      setPets([]);
      return;
    }
    setLoading(true);
    try {
      const storedPets = await getUserPets(user.uid);
      setPets(storedPets);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets])
  );

  const calculateAge = (birthday: string) => {
    if (!birthday) return '0y';
    const birth = new Date(birthday);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (years === 0) {
      return `${months}mo`;
    } else if (months < 0) {
      return `${years - 1}y ${12 + months}mo`;
    } else {
      return `${years}y ${months}mo`;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadPets} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
        <Text style={styles.welcomeSubtitle}>{userProfile?.nickname || t('welcomeSubtitle')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="paw" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{pets.length} {t('pets')}</Text>
          </View>
          {user && (
            <View style={styles.statPill}>
              <Ionicons name="person" size={14} color={COLORS.primary} />
              <Text style={styles.statText}>{userProfile?.nickname || user.phoneNumber}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>{t('pets')}</Text>
        <View style={styles.actionsGrid}>
          {ACTION_CARDS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[styles.actionCard, { backgroundColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Ionicons name={action.icon as any} size={24} color="#FFF" />
              <Text style={styles.actionText}>{t(action.translationKey as any)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* My Pets Section */}
      <View style={styles.petsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('myPets')}</Text>
          {pets.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('PetList')}>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {pets.length === 0 ? (
          <TouchableOpacity style={styles.emptyPetCard} onPress={() => navigation.navigate('AddPet')}>
            <Ionicons name="add-circle-outline" size={40} color={COLORS.textTertiary} />
            <Text style={styles.emptyPetText}>{t('addFirstPet')}</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
            {pets.slice(0, 4).map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => navigation.navigate('PetDetail', { petId: pet.id, pet })}
              >
                <Image
                  source={{ uri: pet.photos?.[0] || pet.avatar || 'https://via.placeholder.com/100' }}
                  style={styles.petImage}
                />
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>{pet.breed}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Quick Stats */}
      {pets.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>{t('age')}</Text>
            <Text style={styles.statsValue}>{calculateAge(pets[0]?.birthday || '')}</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>{t('gender')}</Text>
            <Text style={styles.statsValue}>{t(pets[0]?.gender || 'male')}</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>{t('personality')}</Text>
            <Text style={styles.statsValue}>{pets[0]?.personality?.[0] || '-'}</Text>
          </View>
        </View>
      )}

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeSection: {
    padding: SPACING.lg,
  },
  welcomeTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  statText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  actionsSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: SPACING.xs,
  },
  petsSection: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
  },
  petScroll: {
    marginTop: SPACING.sm,
  },
  petCard: {
    marginRight: SPACING.md,
    alignItems: 'center',
    width: 100,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.divider,
  },
  petName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  petBreed: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  emptyPetCard: {
    height: 100,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyPetText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statsValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
});
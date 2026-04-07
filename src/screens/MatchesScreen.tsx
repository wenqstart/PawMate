import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { t } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { getUserMatches, Match } from '../firebase/auth';

export default function MatchesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userMatches = await getUserMatches(user.uid);
      setMatches(userMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  const getOtherPet = (match: Match) => {
    if (!match.petDetails || match.petDetails.length < 2) return null;
    // Get the pet that is not owned by the current user
    const otherPet = match.petDetails[0].ownerId === user?.uid
      ? match.petDetails[1]
      : match.petDetails[0];
    return otherPet;
  };

  const renderMatchItem = ({ item }: { item: Match }) => {
    const otherPet = getOtherPet(item);
    if (!otherPet) return null;

    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => navigation.navigate('Chat', { matchId: item.id, match: item })}
      >
        <Image
          source={{ uri: otherPet.photos?.[0] || otherPet.avatar }}
          style={styles.petImage}
        />
        <View style={styles.matchInfo}>
          <Text style={styles.petName}>{otherPet.name}</Text>
          <Text style={styles.petBreed}>{otherPet.breed}</Text>
          <Text style={styles.matchTime}>
            {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : ''}
          </Text>
        </View>
        <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.notLoggedIn}>{t('login')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t('matches')}</Text>
          <TouchableOpacity
            style={styles.likesButton}
            onPress={() => navigation.navigate('Likes')}
          >
            <Ionicons name="heart" size={20} color={COLORS.accent} />
            <Text style={styles.likesButtonText}>{t('receivedLikes')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyText}>{t('noMatches')}</Text>
          <Text style={styles.emptySubtext}>{t('dating')}</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadMatches} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.md,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primaryLight + '30',
  },
  matchInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  petName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  petBreed: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  matchTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  notLoggedIn: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  likesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  likesButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHT.medium,
  },
});
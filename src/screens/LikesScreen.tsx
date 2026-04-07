import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { t } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { getPendingLikes, likePet, getUserPets, Pet } from '../firebase/auth';

interface PendingLike {
  id: string;
  likedPet: Pet;
  likerPet: Pet;
  message: string;
  createdAt: any;
}

export default function LikesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pendingLikes, setPendingLikes] = useState<PendingLike[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPendingLikes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    console.log('=== Loading Likes Screen ===');
    console.log('User ID:', user.uid);
    try {
      // Get user's pets
      const myPets = await getUserPets(user.uid);
      console.log('My pets count:', myPets.length);
      console.log('My pet IDs:', myPets.map(p => p.id));

      // Get pending likes
      const likes = await getPendingLikes(user.uid);
      console.log('Pending likes:', likes.length);
      setPendingLikes(likes);
    } catch (error) {
      console.error('Error loading pending likes:', error);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadPendingLikes();
    }, [loadPendingLikes])
  );

  const handleAccept = async (like: PendingLike) => {
    if (!user) return;
    try {
      // Use the liked pet and liker pet to create a match
      const result = await likePet(user.uid, like.likedPet.id, like.likerPet.id, like.message);
      if (result.matched) {
        Alert.alert(t('success'), t('alreadyMatched'));
      } else {
        Alert.alert(t('success'), 'Like accepted!');
      }
      loadPendingLikes();
    } catch (error) {
      console.error('Error accepting like:', error);
      Alert.alert(t('error'), 'Failed to accept like');
    }
  };

  const handlePass = (like: PendingLike) => {
    Alert.alert(
      t('pass') || 'Pass',
      'Are you sure you want to pass?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('pass'),
          style: 'destructive',
          onPress: async () => {
            // For now, just remove from list (could add 'rejected' status to database)
            setPendingLikes(prev => prev.filter(l => l.id !== like.id));
          },
        },
      ]
    );
  };

  const renderLikeItem = ({ item }: { item: PendingLike }) => (
    <View style={styles.likeItem}>
      <View style={styles.petRow}>
        <View style={styles.petColumn}>
          <Image
            source={{ uri: item.likerPet.photos?.[0] || item.likerPet.avatar }}
            style={styles.petImage}
          />
          <Text style={styles.petName}>{item.likerPet.name}</Text>
          <Text style={styles.petBreed}>{item.likerPet.breed}</Text>
        </View>

        <View style={styles.heartIcon}>
          <Ionicons name="heart" size={24} color={COLORS.accent} />
        </View>

        <View style={styles.petColumn}>
          <Image
            source={{ uri: item.likedPet.photos?.[0] || item.likedPet.avatar }}
            style={styles.petImage}
          />
          <Text style={styles.petName}>{item.likedPet.name}</Text>
          <Text style={styles.petBreed}>{item.likedPet.breed}</Text>
        </View>
      </View>

      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>"{item.message}"</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handlePass(item)}
        >
          <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          <Text style={styles.passButtonText}>{t('pass')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item)}
        >
          <Ionicons name="heart" size={20} color={COLORS.textInverse} />
          <Text style={styles.acceptButtonText}>{t('like')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>{t('receivedLikes')}</Text>
        <Text style={styles.headerSubtitle}>
          {pendingLikes.length} {t('pending') || 'pending'}
        </Text>
      </View>

      {pendingLikes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyText}>{t('noLikesYet')}</Text>
          <Text style={styles.emptySubtext}>
            {t('dating') || '当有人喜欢你的宠物时，会在这里显示'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingLikes}
          renderItem={renderLikeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadPendingLikes} />
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
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.lg,
  },
  likeItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  petColumn: {
    alignItems: 'center',
    flex: 1,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.primaryLight + '30',
  },
  petName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  petBreed: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  heartIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  messageContainer: {
    backgroundColor: COLORS.primaryLight + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '30',
  },
  messageText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  passButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
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
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  notLoggedIn: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
});
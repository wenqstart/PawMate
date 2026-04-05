import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { useI18n } from '../i18n';

interface CommunityPost {
  id: string;
  user: string;
  petType: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: 'PetLover_XiaoLi',
    petType: 'British Shorthair',
    content: 'Just completed neutering surgery for my cat! Finally done.',
    likes: 28,
    comments: 12,
    time: '2h ago'
  },
  {
    id: '2',
    user: 'CorgiMom',
    petType: 'Corgi',
    content: 'Found a lost dog near the community entrance, already took to the police station',
    likes: 56,
    comments: 34,
    time: '3h ago'
  },
  {
    id: '3',
    user: 'BunnyKeeper',
    petType: 'Holland Lop',
    content: 'First time trying strawberry, reaction is too cute!',
    likes: 89,
    comments: 23,
    time: '5h ago'
  },
  {
    id: '4',
    user: 'RagdollFan',
    petType: 'Ragdoll',
    content: 'New cat tree arrived and the little one loves it!',
    likes: 102,
    comments: 45,
    time: 'Yesterday'
  },
  {
    id: '5',
    user: 'HuskyTeam',
    petType: 'Husky',
    content: 'Came home to this mess... blood pressure rising',
    likes: 234,
    comments: 89,
    time: 'Yesterday'
  }
];

export default function CommunityScreen({ navigation }: any) {
  const { t } = useI18n();

  const renderPost = (post: CommunityPost) => (
    <TouchableOpacity key={post.id} style={styles.postCard} activeOpacity={0.7}>
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="paw" size={20} color={COLORS.textTertiary} />
        </View>
        <View style={styles.postInfo}>
          <View style={styles.userRow}>
            <Text style={styles.userName}>{post.user}</Text>
            <View style={styles.petTypeBadge}>
              <Text style={styles.petTypeText}>{post.petType}</Text>
            </View>
          </View>
          <Text style={styles.postTime}>{post.time}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Topics */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsContainer}
        >
          <TouchableOpacity style={styles.topicTag}>
            <Text style={styles.topicText}>{t('cats')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topicTag}>
            <Text style={styles.topicText}>{t('dogs')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topicTag}>
            <Text style={styles.topicText}>{t('products')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topicTag}>
            <Text style={styles.topicText}>{t('adoption')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topicTag}>
            <Text style={styles.topicText}>{t('tips')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Posts */}
        <View style={styles.postsContainer}>
          {mockPosts.map(renderPost)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topicsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  topicTag: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  topicText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  postsContainer: {
    padding: SPACING.lg,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  petTypeBadge: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  petTypeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  postTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  postContent: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  actionText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
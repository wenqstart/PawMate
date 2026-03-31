import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

interface CommunityPost {
  id: string;
  user: string;
  avatar: string;
  petType: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: '铲屎官小李',
    avatar: '🐱',
    petType: '英短',
    content: '今天带我家毛孩子去做绝育手术，终于完成了喵生大事！',
    likes: 28,
    comments: 12,
    time: '2小时前'
  },
  {
    id: '2',
    user: '旺财妈',
    avatar: '🐕',
    petType: '柯基',
    content: '谁家的柯基走丢了？在小区门口捡到的，已经送到派出所了',
    likes: 56,
    comments: 34,
    time: '3小时前'
  },
  {
    id: '3',
    user: '兔兔饲养员',
    avatar: '🐰',
    petType: '垂耳兔',
    content: '兔兔第一次尝试吃草莓，反应也太可爱了吧！',
    likes: 89,
    comments: 23,
    time: '5小时前'
  },
  {
    id: '4',
    user: '布偶猫奴',
    avatar: '🐱',
    petType: '布偶',
    content: '新买的猫爬架到了逆子表示非常满意！',
    likes: 102,
    comments: 45,
    time: '昨天'
  },
  {
    id: '5',
    user: '哈士奇拆家队',
    avatar: '🐕',
    petType: '哈士奇',
    content: '下班回家看到这一幕血压直接拉满...',
    likes: 234,
    comments: 89,
    time: '昨天'
  }
];

export default function CommunityScreen({ navigation }: any) {
  const renderPost = (post: CommunityPost) => (
    <TouchableOpacity key={post.id} style={styles.postCard} activeOpacity={0.7}>
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{post.avatar}</Text>
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
          <Ionicons name="heart-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 热门话题标签 */}
        <View style={styles.topicContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.topicTag}>
              <Text style={styles.topicText}># 猫咪日常</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicTag}>
              <Text style={styles.topicText}># 狗狗趣事</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicTag}>
              <Text style={styles.topicText}># 宠物用品</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicTag}>
              <Text style={styles.topicText}># 领养救助</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicTag}>
              <Text style={styles.topicText}># 养宠经验</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 帖子列表 */}
        <View style={styles.postList}>
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
  topicContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  topicTag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  topicText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  postList: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  petTypeBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  petTypeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  postTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  postContent: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 14,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
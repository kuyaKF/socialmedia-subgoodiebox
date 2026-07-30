import { Comment } from '../models/Comment';
import { FeedTargetType, Like } from '../models/Like';

interface Engageable {
  _id: unknown;
  type: FeedTargetType;
}

export async function attachEngagement<T extends Engageable>(
  items: T[],
  userId: string
): Promise<(T & { likeCount: number; commentCount: number; likedByMe: boolean })[]> {
  const pairs = items.map((item) => ({ targetType: item.type, targetId: item._id }));
  const matchStage = pairs.length > 0 ? pairs : [{ targetType: '__none__' }];

  const [likeAgg, commentAgg, myLikes] = await Promise.all([
    Like.aggregate([
      { $match: { $or: matchStage } },
      { $group: { _id: { targetType: '$targetType', targetId: '$targetId' }, count: { $sum: 1 } } },
    ]),
    Comment.aggregate([
      { $match: { $or: matchStage } },
      { $group: { _id: { targetType: '$targetType', targetId: '$targetId' }, count: { $sum: 1 } } },
    ]),
    // userId is '' for guests on public routes (e.g. the blog) — nothing can be "liked by me"
    // then, and an empty string would fail ObjectId casting if we queried with it.
    pairs.length > 0 && userId
      ? Like.find({ user: userId, $or: matchStage }).select('targetType targetId')
      : Promise.resolve([]),
  ]);

  const likeCountMap = new Map<string, number>(
    likeAgg.map((l) => [`${l._id.targetType}:${l._id.targetId}`, l.count])
  );
  const commentCountMap = new Map<string, number>(
    commentAgg.map((c) => [`${c._id.targetType}:${c._id.targetId}`, c.count])
  );
  const likedSet = new Set(myLikes.map((l) => `${l.targetType}:${l.targetId}`));

  return items.map((item) => {
    const key = `${item.type}:${item._id}`;
    return {
      ...item,
      likeCount: likeCountMap.get(key) ?? 0,
      commentCount: commentCountMap.get(key) ?? 0,
      likedByMe: likedSet.has(key),
    };
  });
}

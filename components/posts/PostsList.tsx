"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  X,
  Megaphone,
  Phone,
  Clock,
  Building2,
  Trash,
} from "lucide-react";
import { createPost, deletePost } from "@/app/actions/posts";
import type { Post, User } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "غير معروف";
  const date = new Date(dateStr);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return "منذ لحظات";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `منذ ${diffMonths} شهر`;
  return `منذ ${Math.floor(diffDays / 365)} سنة`;
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  canDelete,
  onDelete,
}: {
  post: Post;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-b from-accent/70 via-accent/50 to-accent/30 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {(post.postOfficeName || "م")[0]}
          </div>
          <div>
            <div className="text-text-primary font-semibold">
              {post.postOfficeName || "مكتب محاماة"}
            </div>
            <div className="flex items-center gap-1 text-text-muted text-xs">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(post.postTime || post.createdAt)}
            </div>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-2 text-error hover:bg-error/10 rounded-full transition"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
      </div>

      <div>
        <h3 className="text-text-primary font-bold text-lg mb-2">
          {post.postTitle}
        </h3>
        {post.postContent && (
          <p className="text-text-secondary text-sm leading-relaxed">
            {post.postContent}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostModal({
  onClose,
  currentUser,
  onCreated,
}: {
  onClose: () => void;
  currentUser: User;
  onCreated: (post: Post) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ postTitle: "", postContent: "" });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!form.postTitle.trim()) {
      setError("عنوان الإعلان مطلوب");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createPost({
        postTitle: form.postTitle,
        postContent: form.postContent,
        postOfficeName: currentUser.officeId
          ? undefined
          : `${currentUser.firstName} ${currentUser.lastName}`,
        officeId: currentUser.officeId ?? undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.data) onCreated(result.data);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5" /> إضافة إعلان جديد
          </p>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-light rounded-full"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <p className="text-error text-sm bg-error/10 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              عنوان الإعلان *
            </label>
            <input
              type="text"
              value={form.postTitle}
              onChange={(e) => setForm({ ...form, postTitle: e.target.value })}
              placeholder="أدخل عنوان الإعلان"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary"
            />
          </div>

          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              محتوى الإعلان
            </label>
            <textarea
              value={form.postContent}
              onChange={(e) =>
                setForm({ ...form, postContent: e.target.value })
              }
              placeholder="أدخل تفاصيل وصف الإعلان..."
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary h-32 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-beige-light transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 font-semibold"
          >
            {isPending ? "جاري النشر..." : "نشر الإعلان"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PostsListProps {
  initialPosts: Post[];
  currentUser: User;
}

export default function PostsList({
  initialPosts,
  currentUser,
}: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUser.role.includes("officeOwner");

  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(b.postTime || b.createdAt || 0).getTime() -
      new Date(a.postTime || a.createdAt || 0).getTime(),
  );
  const visiblePosts = sortedPosts.slice(0, visibleCount);

  function handleCreated(newPost: Post) {
    setPosts((prev) => [newPost, ...prev]);
  }

  function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    startTransition(async () => {
      await deletePost(postId);
    });
  }

  return (
    <div dir="rtl" className="w-full bg-background p-8 space-y-8">
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          currentUser={currentUser}
          onCreated={handleCreated}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">الإعلانات</h1>
          <p className="text-text-muted text-sm mt-1">
            إعلانات ومستجدات مكاتب المحاماة
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            إضافة إعلان
          </button>
        )}
      </div>

      {/* Posts list */}
      {posts.length === 0 && (
        <div className="text-center text-text-muted py-20 border border-dashed border-border rounded-xl">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>لا توجد إعلانات حالياً</p>
        </div>
      )}

      <div className="space-y-6">
        {visiblePosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            canDelete={isOwner && post.officeId === currentUser.officeId}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {visibleCount < posts.length && (
        <div className="text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-8 py-3 bg-surface border border-border rounded-lg text-text-primary hover:bg-beige-light transition font-medium"
          >
            تحميل المزيد ({posts.length - visibleCount} متبقي)
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, Trash2, X, FileText } from "lucide-react";
import { adminDeletePost } from "@/app/actions/admin/posts";
import type { Post } from "@/types";

const ITEMS_PER_PAGE = 8;

function DeleteModal({
  title,
  onClose,
  onConfirm,
  isPending,
}: {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-error" />
        </div>
        <h2 className="text-text-primary font-bold text-xl mb-2">
          حذف المنشور
        </h2>
        <p className="text-text-muted text-sm mb-6">
          هل أنت متأكد من حذف "
          <span className="font-semibold text-text-primary">{title}</span>"؟
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-beige-light transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-lg bg-error text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {isPending ? "جاري الحذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export default function AdminPostsTable({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Post | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts
      .filter(
        (p) =>
          p.postTitle?.toLowerCase().includes(q) ||
          p.postOfficeName?.toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [posts, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminDeletePost(selected.id);
      if (!res.error)
        setPosts((prev) => prev.filter((p) => p.id !== selected.id));
      setSelected(null);
    });
  }

  return (
    <div dir="rtl" className="space-y-6">
      {selected && (
        <DeleteModal
          title={selected.postTitle}
          onClose={() => setSelected(null)}
          onConfirm={confirmDelete}
          isPending={isPending}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          إدارة المنشورات
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          عرض وحذف منشورات المكاتب في النظام.
        </p>
      </div>

      <div className="bg-surface p-4 rounded-2xl border border-border">
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="بحث عن منشور بالعنوان أو اسم المكتب..."
            className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
      </div>

      {/* Table — hidden on mobile */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-beige-light/50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                عنوان المنشور
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                المكتب
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                التاريخ
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted text-left">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-16 text-center text-text-muted text-sm"
                >
                  لا توجد منشورات
                </td>
              </tr>
            )}
            {paginated.map((post) => (
              <tr key={post.id} className="hover:bg-beige-light/30 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-text-primary text-sm truncate max-w-xs">
                        {post.postTitle}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5 truncate max-w-xs">
                        {post.postContent?.slice(0, 60)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {post.postOfficeName || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setSelected(post)}
                      className="p-2 hover:bg-error/10 text-error rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — visible on mobile only */}
      <div className="sm:hidden flex flex-col gap-3">
        {paginated.length === 0 && (
          <div className="bg-surface rounded-2xl border border-border py-12 text-center text-text-muted text-sm">
            لا توجد منشورات
          </div>
        )}
        {paginated.map((post) => (
          <div
            key={post.id}
            className="bg-surface rounded-2xl border border-border p-4 flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary text-sm truncate">
                {post.postTitle}
              </div>
              <div className="text-xs text-text-muted mt-0.5 line-clamp-2">
                {post.postContent?.slice(0, 80)}...
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {post.postOfficeName && (
                  <span className="text-xs text-text-secondary">
                    {post.postOfficeName}
                  </span>
                )}
                <span className="text-xs text-text-muted">
                  {formatDate(post.createdAt)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelected(post)}
              className="p-2 hover:bg-error/10 text-error rounded-lg transition flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-beige-light disabled:opacity-40 transition"
          >
            السابق
          </button>
          <span className="text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-beige-light disabled:opacity-40 transition"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

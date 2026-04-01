"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus } from "lucide-react";
import ImportantDates from "./ImportantDates";
import { formatDateTime } from "./helpers";
import { addCaseNote, deleteCaseNote } from "@/app/actions/cases";
import type { Case, CaseNote, User as UserType } from "@/types";

export default function NotesTab({
  caseItem,
  notes,
  currentUser,
  onOpenSessions,
}: {
  caseItem: Case;
  notes: CaseNote[];
  currentUser: UserType;
  onOpenSessions: () => void;
}) {
  const [noteText, setNoteText] = useState("");
  const [localNotes, setLocalNotes] = useState<CaseNote[]>(notes);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!noteText.trim()) return;
    startTransition(async () => {
      const { data, error } = await addCaseNote(caseItem.id, {
        noteTitle: noteText,
        noteOwner: `${currentUser.firstName} ${currentUser.lastName}`,
      });
      if (data && !error) {
        setLocalNotes((prev) => [data, ...prev]);
        setNoteText("");
      }
    });
  };

  const handleDelete = (noteId: string) => {
    startTransition(async () => {
      const { error } = await deleteCaseNote(caseItem.id, noteId);
      if (!error) {
        setLocalNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    });
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-surface rounded-lg border border-border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-text-primary text-xl font-semibold">الملاحظات</h2>
        </div>

        {/* Add note */}
        <div className="flex gap-3 mb-6">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="أضف ملاحظة..."
            className="flex-1 px-4 py-3 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
          />
          <button
            onClick={handleAdd}
            disabled={isPending || !noteText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
          >
            <MessageSquarePlus className="w-5 h-5" />
            إضافة
          </button>
        </div>

        {localNotes.length === 0 && (
          <p className="text-center text-text-muted">لا توجد ملاحظات</p>
        )}

        {localNotes.map((note) => (
          <div
            key={note.id}
            className="bg-beige border border-border rounded-lg p-4 mb-4 text-right"
          >
            <div className="flex justify-between items-start">
              <button
                onClick={() => handleDelete(note.id)}
                disabled={isPending}
                className="text-error hover:text-red-700 text-xs"
              >
                حذف
              </button>
              <div>
                <span className="text-text-muted text-xs">
                  {formatDateTime(note.noteDate || note.createdAt)}
                </span>
                <br />
                <span className="text-text-primary font-semibold text-base">
                  {note.noteOwner}
                </span>
              </div>
            </div>
            <p className="text-text-secondary text-sm mt-2">{note.noteTitle}</p>
          </div>
        ))}
      </div>

      <ImportantDates caseItem={caseItem} onOpenSessions={onOpenSessions} />
    </div>
  );
}

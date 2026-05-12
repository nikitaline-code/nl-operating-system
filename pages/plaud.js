import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PlaudNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [filterExecutive, setFilterExecutive] = useState("All");
  const [uploadingNoteId, setUploadingNoteId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("plaud_notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading PLAUD notes:", error);
      setNotes([]);
    } else {
      setNotes(data || []);
    }

    setLoading(false);
  }

  function toggleExpanded(id) {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  async function uploadAudio(event, noteId) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingNoteId(noteId);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filePath = `${noteId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("plaud-recordings")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      alert("Upload failed. Check your Supabase Storage bucket permissions.");
      setUploadingNoteId(null);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("plaud-recordings").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("plaud_notes")
      .update({ audio_url: publicUrl })
      .eq("id", noteId);

    if (updateError) {
      console.error(updateError);
      alert("Audio uploaded, but the URL could not save to the note.");
      setUploadingNoteId(null);
      return;
    }

    setUploadingNoteId(null);
    await fetchNotes();
    alert("Recording uploaded.");
  }

  async function sendToTasks(note) {
    const { error } = await supabase.from("tasks").insert([
      {
        task: note.title ? `Review PLAUD note: ${note.title}` : "Review PLAUD note",
        details: note.summary || note.transcript || "",
        priority: "Medium",
        completed: false,
        source: "PLAUD",
      },
    ]);

    if (error) {
      console.error(error);
      alert("Could not send to Tasks. Check your tasks table column names.");
    } else {
      alert("Sent to Tasks.");
    }
  }

  async function sendToDecisions(note) {
    const { error } = await supabase.from("decisions").insert([
      {
        title: note.title || "PLAUD decision review",
        notes: note.decisions || note.summary || "",
        status: "Pending",
        source: "PLAUD",
      },
    ]);

    if (error) {
      console.error(error);
      alert("Could not send to Decisions. Check your decisions table column names.");
    } else {
      alert("Sent to Decisions.");
    }
  }

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const combinedText = `
        ${note.title || ""}
        ${note.summary || ""}
        ${note.transcript || ""}
        ${note.action_items || ""}
        ${note.decisions || ""}
        ${note.follow_ups || ""}
        ${note.dealer || ""}
      `.toLowerCase();

      const matchesSearch = combinedText.includes(search.toLowerCase());

      const matchesExecutive =
        filterExecutive === "All" ||
        (note.executive || "").toLowerCase() === filterExecutive.toLowerCase();

      return matchesSearch && matchesExecutive;
    });
  }, [notes, search, filterExecutive]);

  return (
    <div className="page">
      <div className="topBar">
        <div>
          <p className="eyebrow">Executive Workflow</p>
          <h1>PLAUD Notes</h1>
          <p className="subtitle">
            Meeting recordings, summaries, transcripts, action items, and decisions.
          </p>
        </div>

        <button className="refreshBtn" onClick={fetchNotes}>
          Refresh
        </button>
      </div>

      <div className="statsGrid">
        <div className="statCard">
          <span>Total Notes</span>
          <strong>{notes.length}</strong>
        </div>

        <div className="statCard">
          <span>Filtered</span>
          <strong>{filteredNotes.length}</strong>
        </div>

        <div className="statCard">
          <span>Latest</span>
          <strong>{notes[0]?.created_at ? formatDate(notes[0].created_at) : "—"}</strong>
        </div>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes, dealers, transcripts..."
        />

        <select value={filterExecutive} onChange={(e) => setFilterExecutive(e.target.value)}>
          <option>All</option>
          <option>Mark</option>
          <option>Dane</option>
          <option>Nikita</option>
        </select>
      </div>

      <div className="notesList">
        {loading ? (
          <div className="emptyState">Loading PLAUD notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="emptyState">
            No PLAUD notes found. Once Zapier or Supabase has records, they’ll show here.
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isOpen = expanded[note.id];

            return (
              <div className="noteCard" key={note.id}>
                <div className="noteHeader">
                  <div>
                    <div className="noteTitleRow">
                      <h2>{note.title || "Untitled PLAUD Note"}</h2>

                      {note.executive && <span className="badge">{note.executive}</span>}
                      {note.dealer && <span className="badge muted">{note.dealer}</span>}
                      {note.audio_url && <span className="badge audioBadge">Recording</span>}
                    </div>

                    <p className="dateText">
                      {note.meeting_date
                        ? formatDate(note.meeting_date)
                        : note.create_time
                        ? note.create_time
                        : note.created_at
                        ? formatDate(note.created_at)
                        : "No date"}
                    </p>
                  </div>

                  <button className="smallBtn" onClick={() => toggleExpanded(note.id)}>
                    {isOpen ? "Minimize" : "Open"}
                  </button>
                </div>

                <div className="summaryBox">
                  <p>{note.summary || "No summary came through from PLAUD yet."}</p>
                </div>

                {note.audio_url && (
                  <div className="audioWrap">
                    <audio controls className="audioPlayer">
                      <source src={note.audio_url} />
                      Your browser does not support audio.
                    </audio>
                  </div>
                )}

                {isOpen && (
                  <div className="expandedArea">
                    <div className="actions">
                      <label className="uploadBtn">
                        {uploadingNoteId === note.id ? "Uploading..." : "Upload Recording"}
                        <input
                          type="file"
                          accept="audio/*"
                          hidden
                          disabled={uploadingNoteId === note.id}
                          onChange={(e) => uploadAudio(e, note.id)}
                        />
                      </label>

                      <button onClick={() => sendToTasks(note)}>Send to Tasks</button>
                      <button onClick={() => sendToDecisions(note)}>Send to Decisions</button>

                      {note.source_url && (
                        <a href={note.source_url} target="_blank" rel="noreferrer">
                          Open PLAUD Source
                        </a>
                      )}
                    </div>

                    <Section title="Action Items" content={note.action_items} />
                    <Section title="Decisions" content={note.decisions} />
                    <Section title="Follow-Ups" content={note.follow_ups} />
                    <Section title="Transcript" content={note.transcript} large />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f6f8;
          padding: 32px;
          color: #111;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .topBar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
        }

        .eyebrow {
          margin: 0 0 6px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #777;
          font-weight: 600;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 650;
          letter-spacing: -0.03em;
        }

        .subtitle {
          margin: 8px 0 0;
          color: #666;
          font-size: 14px;
        }

        .refreshBtn,
        .smallBtn,
        .actions button,
        .actions a,
        .uploadBtn {
          border: 1px solid #ddd;
          background: white;
          color: #111;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .refreshBtn:hover,
        .smallBtn:hover,
        .actions button:hover,
        .actions a:hover,
        .uploadBtn:hover {
          background: #eeeeee;
          transform: translateY(-1px);
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .statCard {
          background: white;
          border: 1px solid #e7e7e7;
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.035);
        }

        .statCard span {
          display: block;
          font-size: 12px;
          color: #777;
          margin-bottom: 8px;
        }

        .statCard strong {
          font-size: 22px;
          font-weight: 650;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr 180px;
          gap: 12px;
          margin-bottom: 18px;
        }

        input,
        select {
          width: 100%;
          border: 1px solid #ddd;
          background: white;
          border-radius: 14px;
          padding: 13px 14px;
          font-size: 14px;
          outline: none;
        }

        input:focus,
        select:focus {
          border-color: #aaa;
        }

        .notesList {
          display: grid;
          gap: 14px;
        }

        .noteCard {
          background: white;
          border: 1px solid #e7e7e7;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.035);
        }

        .noteHeader {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }

        .noteTitleRow {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 650;
          letter-spacing: -0.02em;
        }

        .badge {
          background: #111;
          color: white;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 600;
        }

        .badge.muted {
          background: #f0f0f0;
          color: #333;
        }

        .badge.audioBadge {
          background: #e9f5ee;
          color: #1f6b3a;
        }

        .dateText {
          margin: 6px 0 0;
          color: #777;
          font-size: 12px;
        }

        .summaryBox {
          margin-top: 14px;
          background: #f7f7f7;
          border-radius: 14px;
          padding: 14px;
          border: 1px solid #ededed;
        }

        .summaryBox p {
          margin: 0;
          font-size: 14px;
          line-height: 1.55;
          color: #333;
          white-space: pre-wrap;
        }

        .audioWrap {
          margin-top: 14px;
          background: #fafafa;
          border: 1px solid #ededed;
          border-radius: 14px;
          padding: 12px;
        }

        .audioPlayer {
          width: 100%;
          display: block;
        }

        .expandedArea {
          margin-top: 16px;
          display: grid;
          gap: 12px;
        }

        .section {
          border: 1px solid #eee;
          border-radius: 16px;
          padding: 14px;
          background: #fff;
        }

        .section h3 {
          margin: 0 0 8px;
          font-size: 13px;
          font-weight: 650;
          color: #111;
        }

        .section p {
          margin: 0;
          color: #444;
          font-size: 13px;
          line-height: 1.55;
          white-space: pre-wrap;
        }

        .section.large p {
          max-height: 340px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 4px;
        }

        .emptyState {
          background: white;
          border: 1px dashed #ddd;
          border-radius: 18px;
          padding: 28px;
          color: #666;
          text-align: center;
        }

        @media (max-width: 800px) {
          .page {
            padding: 20px;
          }

          .topBar {
            flex-direction: column;
          }

          .statsGrid,
          .toolbar {
            grid-template-columns: 1fr;
          }

          .noteHeader {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

function Section({ title, content, large }) {
  return (
    <div className={`section ${large ? "large" : ""}`}>
      <h3>{title}</h3>
      <p>{content || "Nothing captured yet."}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

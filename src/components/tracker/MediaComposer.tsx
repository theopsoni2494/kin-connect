import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Video,
  Camera,
  Paperclip,
  Type,
  Send,
  Square,
  X,
  Loader2,
} from "lucide-react";
import type { Attachment, MediaKind } from "@/lib/types";
import { useUploadAttachment } from "@/lib/tracker-queries";
import { ALLOWED_EXT, MAX_FILE_BYTES, BLOCKED_EXT } from "@/lib/attachment-rules";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  onSubmit: (a: Attachment) => void;
}

const OPTIONS: { key: MediaKind; label: string; icon: typeof Type }[] = [
  { key: "text", label: "Text", icon: Type },
  { key: "voice", label: "Voice note", icon: Mic },
  { key: "video", label: "Record video", icon: Video },
  { key: "photo", label: "Capture photo", icon: Camera },
  { key: "file", label: "Upload file", icon: Paperclip },
];

function validateFile(file: File | Blob, name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (BLOCKED_EXT.includes(ext)) throw new Error(".zip files are not allowed");
  if (!ALLOWED_EXT.includes(ext)) throw new Error(`Unsupported file type: .${ext}`);
  if (file.size > MAX_FILE_BYTES) throw new Error("File exceeds 5MB limit");
}

export function MediaComposer({ onSubmit }: Props) {
  const [mode, setMode] = useState<MediaKind | null>(null);
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [localPreview, setLocalPreview] = useState<{ blob: Blob; name: string; url: string } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uploadAttachment = useUploadAttachment();

  useEffect(() => {
    return () => stopStream();
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function reset() {
    stopStream();
    recorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);
    if (localPreview) URL.revokeObjectURL(localPreview.url);
    setLocalPreview(null);
    setText("");
  }

  function pickMode(m: MediaKind) {
    reset();
    setMode(m);
  }

  async function startAudio() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = s;
      const rec = new MediaRecorder(s);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          validateFile(blob, "voice-note.webm");
          setLocalPreview({ blob, name: "voice-note.webm", url: URL.createObjectURL(blob) });
        } catch (err) {
          toast.error((err as Error).message);
        }
        stopStream();
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  }

  async function startVideo() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      const rec = new MediaRecorder(s);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        try {
          validateFile(blob, "video.webm");
          setLocalPreview({ blob, name: "video.webm", url: URL.createObjectURL(blob) });
        } catch (err) {
          toast.error((err as Error).message);
        }
        stopStream();
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Camera access denied");
    }
  }

  async function startPhoto() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch {
      toast.error("Camera access denied");
    }
  }

  function capturePhoto() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      try {
        validateFile(blob, "photo.png");
        setLocalPreview({ blob, name: "photo.png", url: URL.createObjectURL(blob) });
        stopStream();
      } catch (err) {
        toast.error((err as Error).message);
      }
    }, "image/png");
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      validateFile(f, f.name);
      setLocalPreview({ blob: f, name: f.name, url: URL.createObjectURL(f) });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      e.target.value = "";
    }
  }

  async function submit() {
    if (mode === "text") {
      if (!text.trim()) return toast.error("Please describe the issue");
      try {
        const attachment = await uploadAttachment.mutateAsync({ kind: "text", text: text.trim() });
        onSubmit(attachment);
        reset();
        setMode(null);
      } catch (err) {
        toast.error((err as Error).message);
      }
      return;
    }
    if (!localPreview || !mode) return toast.error("Nothing to submit yet");
    try {
      const attachment = await uploadAttachment.mutateAsync({
        kind: mode,
        file: localPreview.blob,
        fileName: localPreview.name,
      });
      onSubmit(attachment);
      reset();
      setMode(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const submitting = uploadAttachment.isPending;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => {
              pickMode(o.key);
              if (o.key === "voice") startAudio();
              if (o.key === "video") startVideo();
              if (o.key === "photo") startPhoto();
            }}
            className={cn(
              "group flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all",
              mode === o.key
                ? "border-primary/40 bg-primary/5 text-primary shadow-sm"
                : "border-border bg-background/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
            )}
          >
            <o.icon className="h-4 w-4" />
            {o.label}
          </button>
        ))}
      </div>

      {mode === "text" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the issue in detail…"
          rows={4}
          className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none ring-ring/30 transition placeholder:text-muted-foreground focus:ring-2"
        />
      )}

      {(mode === "video" || mode === "photo") && !localPreview && (
        <div className="overflow-hidden rounded-xl border bg-black/90">
          <video ref={videoRef} muted className="aspect-video w-full object-cover" />
        </div>
      )}

      {mode === "voice" && !localPreview && (
        <div className="flex items-center justify-center gap-3 rounded-xl border bg-muted/40 py-8">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              recording ? "animate-pulse bg-destructive/15 text-destructive" : "bg-primary/10 text-primary",
            )}
          >
            <Mic className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            {recording ? "Recording voice note…" : "Preparing microphone…"}
          </p>
        </div>
      )}

      {mode === "file" && !localPreview && (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5">
          <Paperclip className="h-5 w-5" />
          <span>Click to upload a file (max 5MB)</span>
          <span className="text-xs">Allowed: {ALLOWED_EXT.join(", ")} · No .zip</span>
          <input
            type="file"
            hidden
            accept={ALLOWED_EXT.map((e) => "." + e).join(",")}
            onChange={handleFile}
          />
        </label>
      )}

      {localPreview && mode && (
        <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3">
          <LocalMediaPreview kind={mode} url={localPreview.url} name={localPreview.name} />
          <button
            onClick={() => {
              URL.revokeObjectURL(localPreview.url);
              setLocalPreview(null);
            }}
            className="ml-auto rounded-lg p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {mode && (
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              reset();
              setMode(null);
            }}
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {mode === "voice" && recording && (
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/15"
              >
                <Square className="h-3.5 w-3.5 fill-current" /> Stop
              </button>
            )}
            {mode === "video" &&
              (recording ? (
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/15"
                >
                  <Square className="h-3.5 w-3.5 fill-current" /> Stop
                </button>
              ) : null)}
            {mode === "photo" && !localPreview && (
              <button
                onClick={capturePhoto}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
              >
                <Camera className="h-4 w-4" /> Capture
              </button>
            )}
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LocalMediaPreview({ kind, url, name }: { kind: MediaKind; url: string; name: string }) {
  if (kind === "photo") return <img src={url} alt="capture" className="max-h-64 rounded-lg" />;
  if (kind === "video") return <video src={url} controls className="max-h-64 rounded-lg" />;
  if (kind === "voice") return <audio src={url} controls className="w-full" />;
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-foreground">
      <Paperclip className="h-4 w-4 text-muted-foreground" />
      {name}
    </span>
  );
}

export function AttachmentPreview({ a }: { a: Attachment }) {
  if (a.kind === "text") return <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{a.text}</p>;
  if (!a.url) return <p className="text-sm text-muted-foreground">Attachment unavailable</p>;
  if (a.kind === "photo") return <img src={a.url} alt="capture" className="max-h-64 rounded-lg" />;
  if (a.kind === "video") return <video src={a.url} controls className="max-h-64 rounded-lg" />;
  if (a.kind === "voice") return <audio src={a.url} controls className="w-full" />;
  return (
    <a
      href={a.url}
      download={a.name ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition hover:bg-muted"
    >
      <Paperclip className="h-4 w-4 text-muted-foreground" />
      {a.name}
    </a>
  );
}

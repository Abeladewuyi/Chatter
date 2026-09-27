import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Code2,
  Palette,
  BarChart3,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { createPost } from "../../firebase/posts";
import {
  uploadImageToWorker,
  validateImageFile,
} from "../../utils/uploadImage";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user.uid);
  const fileInputRef = useRef(null);

  const [text, setText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySetting, setReplySetting] = useState("Everyone can reply");
  const [pollOpen, setPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", ""]);

  function handleImageButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    if (imageFiles.length + selectedFiles.length > 4) {
      setError("You can add up to 4 images to one post.");
      return;
    }

    for (const file of selectedFiles) {
      const validationError = validateImageFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError("");
    setImageFiles((current) => [...current, ...selectedFiles]);
    setImagePreviews((current) => [
      ...current,
      ...selectedFiles.map((file) => URL.createObjectURL(file)),
    ]);

    event.target.value = "";
  }

  function removeImage(index) {
    setImageFiles((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );

    setImagePreviews((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  function addTag(newTag) {
    const sanitizedTag = newTag.trim();

    if (!sanitizedTag || !sanitizedTag.startsWith("#")) return;

    setTags((current) => {
      const next = [...current, sanitizedTag];
      return next.filter(
        (tag, index, array) => array.indexOf(tag) === index
      );
    });

    setTagInput("");
  }

  function handleTagKeyDown(event) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      addTag(tagInput);
    }

    if (event.key === "Backspace" && !tagInput && tags.length > 0) {
      event.preventDefault();
      setTags((current) => current.slice(0, -1));
    }
  }

  function addPollOption() {
    setPollOptions((current) => [...current, ""]);
  }

  function updatePollOption(index, value) {
    setPollOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!text.trim() && imageFiles.length === 0) {
      setError("Write something or add an image before posting.");
      return;
    }

    if (!profile) {
      setError("Your profile is still loading. Please try again.");
      return;
    }

    if (pollOpen) {
      const trimmedQuestion = pollQuestion.trim();
      const trimmedOptions = pollOptions
        .map((option) => option.trim())
        .filter(Boolean);

      if (!trimmedQuestion) {
        setError("Add a poll question before posting.");
        return;
      }

      if (trimmedOptions.length < 2) {
        setError("A poll needs at least 2 answer choices.");
        return;
      }
    }

    setError("");
    setSubmitting(true);

    const pollPayload = pollOpen
      ? {
          question: pollQuestion.trim(),
          options: pollOptions
            .map((option, index) => ({
              id: `option-${index}`,
              text: option.trim(),
              votes: 0,
            }))
            .filter((option) => option.text),
        }
      : null;

    try {
      const idToken = await user.getIdToken(true);

      const imageURLs = await Promise.all(
        imageFiles.map((file) =>
          uploadImageToWorker(file, "post-images", idToken)
        )
      );

      await createPost({
        authorId: user.uid,
        authorUsername: profile.username,
        authorDisplayName: profile.displayName,
        authorPhotoURL: profile.photoURL,
        text: `${text.trim()} ${tags.join(" ")}`.trim(),
        tags,
        poll: pollPayload,
        imageURLs,
      });

      navigate("/");
    } catch (firebaseError) {
      console.error(firebaseError);
      setError(firebaseError.message || "Couldn't create your post.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6">
        <header className="relative mb-8 flex items-center justify-center">
          <Link
            to="/"
            aria-label="Cancel"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text-primary"
          >
            <X size={20} />
          </Link>

          <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">
            Create post
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-4"
        >
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            rows={8}
            placeholder="What's on your mind?"
            className="w-full resize-none bg-transparent p-0 text-base text-text-primary outline-none placeholder:text-text-muted"
          />

          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={preview} className="relative">
                  <img
                    src={preview}
                    alt={`Selected image ${index + 1}`}
className="max-h-80 w-full rounded-xl bg-surface-2 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-text-secondary">
              Uploads
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={handleImageButtonClick}
                className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2 py-2 text-[11px] font-medium transition ${
                  imageFiles.length > 0
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border bg-surface-2 text-text-primary hover:border-accent"
                }`}
              >
                <ImageIcon size={13} />
                {imageFiles.length > 0
                  ? `${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"} added`
                  : "Images"}
              </button>

              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-2 text-[11px] font-medium text-text-muted opacity-50"
              >
                <Code2 size={13} />
                Code
              </button>

              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-2 text-[11px] font-medium text-text-muted opacity-50"
              >
                <Palette size={13} />
                Design
              </button>

              <button
                type="button"
                onClick={() => setPollOpen((current) => !current)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2 py-2 text-[11px] font-medium transition ${
                  pollOpen
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border bg-surface-2 text-text-primary hover:border-accent"
                }`}
              >
                <BarChart3 size={13} />
                Poll
              </button>
            </div>
          </div>

          {pollOpen && (
            <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-3">
              <div className="space-y-2">
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(event) => setPollQuestion(event.target.value)}
                  placeholder="Question"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text-primary outline-none"
                />

                {pollOptions.map((option, index) => (
                  <input
                    key={`poll-option-${index}`}
                    type="text"
                    value={option}
                    onChange={(event) =>
                      updatePollOption(index, event.target.value)
                    }
                    placeholder="Answer"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text-primary outline-none"
                  />
                ))}

                <button
                  type="button"
                  onClick={addPollOption}
                  className="flex w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface px-3 py-3 text-2xl text-text-secondary"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
            <div className="flex min-h-[40px] flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-text-primary"
                >
                  {tag}
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "#Add tags..." : ""}
                className="min-w-[120px] flex-1 bg-transparent text-sm text-text-primary outline-none"
              />
            </div>
          </div>

          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => setReplyOpen((current) => !current)}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">
                  Reply settings
                </span>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="text-xs">{replySetting}</span>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {replyOpen && (
              <div className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                {[
                  "Everyone can reply",
                  "Verified users can reply",
                  "No one can reply",
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setReplySetting(option);
                      setReplyOpen(false);
                    }}
                    className="block w-full px-3 py-2.5 text-left text-sm text-text-secondary hover:bg-surface-2"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-3 text-xs text-text-muted">{text.length}/500</p>

            <button
              type="submit"
              disabled={
                submitting || (!text.trim() && imageFiles.length === 0)
              }
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitting
                ? imageFiles.length > 0
                  ? "Uploading..."
                  : "Posting..."
                : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
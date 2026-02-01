/**
 * Records audio from a MediaStream and returns an object with:
 * - promise: resolves with the audio blob when recording stops
 * - stop: function to stop the recording
 */
export function recordAudio(stream: MediaStream) {
  const mimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];

  let selectedMimeType = "audio/webm";
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      selectedMimeType = mimeType;
      console.log("[Audio] Using codec:", mimeType);
      break;
    }
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: selectedMimeType,
    audioBitsPerSecond: 128000,
  });

  const chunks: Blob[] = [];

  const promise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: selectedMimeType });
      console.log("[Audio] Recording finished:", {
        size: blob.size,
        type: blob.type,
      });
      resolve(blob);
    };

    mediaRecorder.onerror = (error) => {
      reject(error);
    };
  });

  mediaRecorder.start();

  return {
    promise,
    stop: () => mediaRecorder.stop(),
  };
}
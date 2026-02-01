/**
 * Records audio from a MediaStream and returns the audio blob
 */
export function recordAudio(stream: MediaStream): Promise<Blob> {
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
  
    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        resolve(blob);
      };
  
      mediaRecorder.onerror = (error) => {
        reject(error);
      };
  
      mediaRecorder.start();
    });
  }
  
  /**
   * Dummy transcription function for UI purposes
   * In production, this should call your transcription API
   */
  export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    // Simulate transcription delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Return empty string for now (UI only)
    return "";
  }
  
  // Expose stop method on the recordAudio function
  recordAudio.stop = function () {
    // This will be set by the actual recording instance
  };
# Message Input
A textarea component with file attachment support, auto-resizing, and drag-and-drop capabilities.
PreviewCode
Copy
The MessageInput component provides a rich textarea experience with support for file attachments, auto-resizing, and drag-and-drop file uploads.
##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#features)Features
  * Auto-resizing textarea
  * File attachments support
  * Drag and drop file uploads
  * Submit on Enter (configurable)
  * Stop generation button
  * Double-enter interrupt behavior
  * Voice input with transcription
  * Fully customizable styling


##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#installation)Installation
CLI
```
npx shadcn@latest add https://shadcn-chatbot-kit.vercel.app/r/message-input.json
```

MANUAL:
```
npm install framer-motion@11 remeda@2
```

```audio-utils.ts (example)
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Create a File object with the correct MIME type
  const audioFile = new File([audioBlob], "recording.webm", {
    type: "audio/webm",
  })

  const formData = new FormData()
  formData.append("audio", audioFile)

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to transcribe audio")
  }

  const data = await response.json()
  return data.text
}
```

```components/ui/message-input.tsx
"use client"
 
import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Info, Loader2, Mic, Paperclip, Square, X } from "lucide-react"
import { omit } from "remeda"
 
import { cn } from "@/lib/utils"
import { useAudioRecording } from "@/components/hooks/use-audio-recording"
import { useAutosizeTextArea } from "@/components/hooks/use-autosize-textarea"
import { AudioVisualizer } from "@/components/ui/audio-visualizer"
import { Button } from "@/components/ui/button"
import { FilePreview } from "@/components/ui/file-preview"
import { InterruptPrompt } from "@/components/ui/interrupt-prompt"
 
interface MessageInputBaseProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  submitOnEnter?: boolean
  stop?: () => void
  isGenerating: boolean
  enableInterrupt?: boolean
  transcribeAudio?: (blob: Blob) => Promise<string>
}
 
interface MessageInputWithoutAttachmentProps extends MessageInputBaseProps {
  allowAttachments?: false
}
 
interface MessageInputWithAttachmentsProps extends MessageInputBaseProps {
  allowAttachments: true
  files: File[] | null
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>
}
 
type MessageInputProps =
  | MessageInputWithoutAttachmentProps
  | MessageInputWithAttachmentsProps
 
export function MessageInput({
  placeholder = "Ask AI...",
  className,
  onKeyDown: onKeyDownProp,
  submitOnEnter = true,
  stop,
  isGenerating,
  enableInterrupt = true,
  transcribeAudio,
  ...props
}: MessageInputProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showInterruptPrompt, setShowInterruptPrompt] = useState(false)
 
  const {
    isListening,
    isSpeechSupported,
    isRecording,
    isTranscribing,
    audioStream,
    toggleListening,
    stopRecording,
  } = useAudioRecording({
    transcribeAudio,
    onTranscriptionComplete: (text) => {
      props.onChange?.({ target: { value: text } } as any)
    },
  })
 
  useEffect(() => {
    if (!isGenerating) {
      setShowInterruptPrompt(false)
    }
  }, [isGenerating])
 
  const addFiles = (files: File[] | null) => {
    if (props.allowAttachments) {
      props.setFiles((currentFiles) => {
        if (currentFiles === null) {
          return files
        }
 
        if (files === null) {
          return currentFiles
        }
 
        return [...currentFiles, ...files]
      })
    }
  }
 
  const onDragOver = (event: React.DragEvent) => {
    if (props.allowAttachments !== true) return
    event.preventDefault()
    setIsDragging(true)
  }
 
  const onDragLeave = (event: React.DragEvent) => {
    if (props.allowAttachments !== true) return
    event.preventDefault()
    setIsDragging(false)
  }
 
  const onDrop = (event: React.DragEvent) => {
    setIsDragging(false)
    if (props.allowAttachments !== true) return
    event.preventDefault()
    const dataTransfer = event.dataTransfer
    if (dataTransfer.files.length) {
      addFiles(Array.from(dataTransfer.files))
    }
  }
 
  const onPaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return
 
    const text = event.clipboardData.getData("text")
    if (text && text.length > 500 && props.allowAttachments) {
      event.preventDefault()
      const blob = new Blob([text], { type: "text/plain" })
      const file = new File([blob], "Pasted text", {
        type: "text/plain",
        lastModified: Date.now(),
      })
      addFiles([file])
      return
    }
 
    const files = Array.from(items)
      .map((item) => item.getAsFile())
      .filter((file) => file !== null)
 
    if (props.allowAttachments && files.length > 0) {
      addFiles(files)
    }
  }
 
  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
 
      if (isGenerating && stop && enableInterrupt) {
        if (showInterruptPrompt) {
          stop()
          setShowInterruptPrompt(false)
          event.currentTarget.form?.requestSubmit()
        } else if (
          props.value ||
          (props.allowAttachments && props.files?.length)
        ) {
          setShowInterruptPrompt(true)
          return
        }
      }
 
      event.currentTarget.form?.requestSubmit()
    }
 
    onKeyDownProp?.(event)
  }
 
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [textAreaHeight, setTextAreaHeight] = useState<number>(0)
 
  useEffect(() => {
    if (textAreaRef.current) {
      setTextAreaHeight(textAreaRef.current.offsetHeight)
    }
  }, [props.value])
 
  const showFileList =
    props.allowAttachments && props.files && props.files.length > 0
 
  useAutosizeTextArea({
    ref: textAreaRef,
    maxHeight: 240,
    borderWidth: 1,
    dependencies: [props.value, showFileList],
  })
 
  return (
    <div
      className="relative flex w-full"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {enableInterrupt && (
        <InterruptPrompt
          isOpen={showInterruptPrompt}
          close={() => setShowInterruptPrompt(false)}
        />
      )}
 
      <RecordingPrompt
        isVisible={isRecording}
        onStopRecording={stopRecording}
      />
 
      <div className="relative flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <textarea
            aria-label="Write your prompt here"
            placeholder={placeholder}
            ref={textAreaRef}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            className={cn(
              "z-10 w-full grow resize-none rounded-xl border border-input bg-background p-3 pr-24 text-sm ring-offset-background transition-[border] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              showFileList && "pb-16",
              className
            )}
            {...(props.allowAttachments
              ? omit(props, ["allowAttachments", "files", "setFiles"])
              : omit(props, ["allowAttachments"]))}
          />
 
          {props.allowAttachments && (
            <div className="absolute inset-x-3 bottom-0 z-20 overflow-x-scroll py-3">
              <div className="flex space-x-3">
                <AnimatePresence mode="popLayout">
                  {props.files?.map((file) => {
                    return (
                      <FilePreview
                        key={file.name + String(file.lastModified)}
                        file={file}
                        onRemove={() => {
                          props.setFiles((files) => {
                            if (!files) return null
 
                            const filtered = Array.from(files).filter(
                              (f) => f !== file
                            )
                            if (filtered.length === 0) return null
                            return filtered
                          })
                        }}
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
 
      <div className="absolute right-3 top-3 z-20 flex gap-2">
        {props.allowAttachments && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            aria-label="Attach a file"
            onClick={async () => {
              const files = await showFileUploadDialog()
              addFiles(files)
            }}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        )}
        {isSpeechSupported && (
          <Button
            type="button"
            variant="outline"
            className={cn("h-8 w-8", isListening && "text-primary")}
            aria-label="Voice input"
            size="icon"
            onClick={toggleListening}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
        {isGenerating && stop ? (
          <Button
            type="button"
            size="icon"
            className="h-8 w-8"
            aria-label="Stop generating"
            onClick={stop}
          >
            <Square className="h-3 w-3 animate-pulse" fill="currentColor" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 transition-opacity"
            aria-label="Send message"
            disabled={props.value === "" || isGenerating}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>
 
      {props.allowAttachments && <FileUploadOverlay isDragging={isDragging} />}
 
      <RecordingControls
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        audioStream={audioStream}
        textAreaHeight={textAreaHeight}
        onStopRecording={stopRecording}
      />
    </div>
  )
}
MessageInput.displayName = "MessageInput"
 
interface FileUploadOverlayProps {
  isDragging: boolean
}
 
function FileUploadOverlay({ isDragging }: FileUploadOverlayProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden
        >
          <Paperclip className="h-4 w-4" />
          <span>Drop your files here to attach them.</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
 
function showFileUploadDialog() {
  const input = document.createElement("input")
 
  input.type = "file"
  input.multiple = true
  input.accept = "*/*"
  input.click()
 
  return new Promise<File[] | null>((resolve) => {
    input.onchange = (e) => {
      const files = (e.currentTarget as HTMLInputElement).files
 
      if (files) {
        resolve(Array.from(files))
        return
      }
 
      resolve(null)
    }
  })
}
 
function TranscribingOverlay() {
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <motion.div
          className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-primary/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        Transcribing audio...
      </p>
    </motion.div>
  )
}
 
interface RecordingPromptProps {
  isVisible: boolean
  onStopRecording: () => void
}
 
function RecordingPrompt({ isVisible, onStopRecording }: RecordingPromptProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ top: 0, filter: "blur(5px)" }}
          animate={{
            top: -40,
            filter: "blur(0px)",
            transition: {
              type: "spring",
              filter: { type: "tween" },
            },
          }}
          exit={{ top: 0, filter: "blur(5px)" }}
          className="absolute left-1/2 flex -translate-x-1/2 cursor-pointer overflow-hidden whitespace-nowrap rounded-full border bg-background py-1 text-center text-sm text-muted-foreground"
          onClick={onStopRecording}
        >
          <span className="mx-2.5 flex items-center">
            <Info className="mr-2 h-3 w-3" />
            Click to finish recording
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
 
interface RecordingControlsProps {
  isRecording: boolean
  isTranscribing: boolean
  audioStream: MediaStream | null
  textAreaHeight: number
  onStopRecording: () => void
}
 
function RecordingControls({
  isRecording,
  isTranscribing,
  audioStream,
  textAreaHeight,
  onStopRecording,
}: RecordingControlsProps) {
  if (isRecording) {
    return (
      <div
        className="absolute inset-[1px] z-50 overflow-hidden rounded-xl"
        style={{ height: textAreaHeight - 2 }}
      >
        <AudioVisualizer
          stream={audioStream}
          isRecording={isRecording}
          onClick={onStopRecording}
        />
      </div>
    )
  }
 
  if (isTranscribing) {
    return (
      <div
        className="absolute inset-[1px] z-50 overflow-hidden rounded-xl"
        style={{ height: textAreaHeight - 2 }}
      >
        <TranscribingOverlay />
      </div>
    )
  }
 
  return null
}
```

```hooks/use-autosize-textarea.ts
import { useLayoutEffect, useRef } from "react"
 
interface UseAutosizeTextAreaProps {
  ref: React.RefObject<HTMLTextAreaElement>
  maxHeight?: number
  borderWidth?: number
  dependencies: React.DependencyList
}
 
export function useAutosizeTextArea({
  ref,
  maxHeight = Number.MAX_SAFE_INTEGER,
  borderWidth = 0,
  dependencies,
}: UseAutosizeTextAreaProps) {
  const originalHeight = useRef<number | null>(null)
 
  useLayoutEffect(() => {
    if (!ref.current) return
 
    const currentRef = ref.current
    const borderAdjustment = borderWidth * 2
 
    if (originalHeight.current === null) {
      originalHeight.current = currentRef.scrollHeight - borderAdjustment
    }
 
    currentRef.style.removeProperty("height")
    const scrollHeight = currentRef.scrollHeight
 
    // Make sure we don't go over maxHeight
    const clampedToMax = Math.min(scrollHeight, maxHeight)
    // Make sure we don't go less than the original height
    const clampedToMin = Math.max(clampedToMax, originalHeight.current)
 
    currentRef.style.height = `${clampedToMin + borderAdjustment}px`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxHeight, ref, ...dependencies])
}
```

```hooks/use-audio-recording.ts
import { useEffect, useRef, useState } from "react"
 
import { recordAudio } from "@/components/lib/audio-utils"
 
interface UseAudioRecordingOptions {
  transcribeAudio?: (blob: Blob) => Promise<string>
  onTranscriptionComplete?: (text: string) => void
}
 
export function useAudioRecording({
  transcribeAudio,
  onTranscriptionComplete,
}: UseAudioRecordingOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(!!transcribeAudio)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const activeRecordingRef = useRef<any>(null)
 
  useEffect(() => {
    const checkSpeechSupport = async () => {
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      )
      setIsSpeechSupported(hasMediaDevices && !!transcribeAudio)
    }
 
    checkSpeechSupport()
  }, [transcribeAudio])
 
  const stopRecording = async () => {
    setIsRecording(false)
    setIsTranscribing(true)
    try {
      // First stop the recording to get the final blob
      recordAudio.stop()
      // Wait for the recording promise to resolve with the final blob
      const recording = await activeRecordingRef.current
      if (transcribeAudio) {
        const text = await transcribeAudio(recording)
        onTranscriptionComplete?.(text)
      }
    } catch (error) {
      console.error("Error transcribing audio:", error)
    } finally {
      setIsTranscribing(false)
      setIsListening(false)
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
        setAudioStream(null)
      }
      activeRecordingRef.current = null
    }
  }
 
  const toggleListening = async () => {
    if (!isListening) {
      try {
        setIsListening(true)
        setIsRecording(true)
        // Get audio stream first
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        setAudioStream(stream)
 
        // Start recording with the stream
        activeRecordingRef.current = recordAudio(stream)
      } catch (error) {
        console.error("Error recording audio:", error)
        setIsListening(false)
        setIsRecording(false)
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop())
          setAudioStream(null)
        }
      }
    } else {
      await stopRecording()
    }
  }
 
  return {
    isListening,
    isSpeechSupported,
    isRecording,
    isTranscribing,
    audioStream,
    toggleListening,
    stopRecording,
  }
}
```

##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#usage)Usage
###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#basic-usage)Basic Usage
```
import { MessageInput } from "@/components/ui/message-input"
export function BasicMessageInput() {
  return (
    <MessageInput
      value={input}
      onChange={handleInputChange}
      isGenerating={false}
    />
  )
}
```

###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#with-interrupt-behavior)With Interrupt Behavior
```
export function MessageInputWithInterrupt() {
  return (
    <MessageInput
      value={input}
      onChange={handleInputChange}
      isGenerating={isGenerating}
      stop={handleStop}
      enableInterrupt={true}
    />
  )
}
```

When `enableInterrupt` is enabled and `isGenerating` is true, pressing Enter once will show a prompt asking the user to press Enter again to interrupt the generation. The prompt will disappear either when the user presses Enter again (triggering the stop function) or when the generation completes.
###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#with-file-attachments)With File Attachments
```
import { MessageInput } from "@/components/ui/message-input"
export function MessageInputWithAttachments() {
  const [files, setFiles] = useState<File[] | null>(null)
  return (
    <MessageInput
      value={input}
      onChange={handleInputChange}
      isGenerating={false}
      allowAttachments
      files={files}
      setFiles={setFiles}
    />
  )
}
```

###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#with-stop-button)With Stop Button
```
import { MessageInput } from "@/components/ui/message-input"
export function MessageInputWithStop() {
  return (
    <MessageInput
      value={input}
      onChange={handleInputChange}
      isGenerating={true}
      stop={() => {
        // Handle stop generation
      }}
    />
  )
}
```

##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#props)Props
The MessageInput component accepts two sets of props depending on whether file attachments are enabled.
###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#props-1)Props
Prop | Type | Description | Default  
---|---|---|---  
`value` | `string` | Current input value | Required  
`submitOnEnter` | `boolean` | Whether to submit on Enter key | `true`  
`stop` | `() => void` | Function to stop generation | -  
`isGenerating` | `boolean` | Whether AI is generating | Required  
`placeholder` | `string` | Input placeholder text | "Ask AI..."  
`allowAttachments` | `boolean` | Enable file attachments | -  
`enableInterrupt` | `boolean` | Enable double-enter interrupt | `true`  
`transcribeAudio` | `(blob: Blob) => Promise<string>` | Function to transcribe audio | -  
###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#with-attachments)With Attachments
When `allowAttachments` is `true`, these additional props are required:
Prop | Type | Description  
---|---|---  
`files` | `File[] | null` | Currently attached files  
`setFiles` | `React.Dispatch<React.SetStateAction<File[] | null>>` | Files state setter  
The component also accepts all standard textarea HTML attributes.
###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#voice-input)Voice Input
Enable voice input with audio transcription:
```
<MessageInput
  value={input}
  onChange={handleInputChange}
  isGenerating={false}
  transcribeAudio={transcribeAudio}
/>
```

The voice input button will only be shown if the `transcribeAudio` prop is provided. This function should take a Blob of recorded audio and return a Promise that resolves to the transcribed text.
##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#features-1)Features
###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#auto-resizing)Auto-resizing
The textarea automatically resizes based on content up to a maximum height of 240px.
```
<MessageInput value={input} onChange={handleInputChange} isGenerating={false} />
```

###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#file-attachments)File Attachments
Enable file attachments with drag-and-drop support:
```
<MessageInput
  value={input}
  onChange={handleInputChange}
  isGenerating={false}
  allowAttachments
  files={files}
  setFiles={setFiles}
/>
```

###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#submit-behavior)Submit Behavior
Control whether Enter key submits the form:
```
<MessageInput
  value={input}
  onChange={handleInputChange}
  isGenerating={false}
  submitOnEnter={false} // Disable submit on Enter
/>
```

###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#generation-control)Generation Control
Show stop button during generation:
```
<MessageInput
  value={input}
  onChange={handleInputChange}
  isGenerating={true}
  stop={() => {
    // Handle stop
  }}
/>
```

###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#interrupt-behavior)Interrupt Behavior
The double-enter interrupt behavior is enabled by default. To disable it:
```
<MessageInput
  value={input}
  onChange={handleInputChange}
  isGenerating={isGenerating}
  stop={handleStop}
  enableInterrupt={false}
/>
```

##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#theming)Theming
The Chat component is using theme colors and fully themable with CSS variables.
[](https://shadcn-chatbot-kit.vercel.app/docs/components/chat)[Message List](https://shadcn-chatbot-kit.vercel.app/docs/components/message-list)
On This Page
  * [Features](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#features)
  * [Installation](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#installation)
  * [Usage](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#usage)
    * [Basic Usage](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#basic-usage)
    * [With Interrupt Behavior](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#with-interrupt-behavior)
    * [With File Attachments](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#with-file-attachments)
    * [With Stop Button](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#with-stop-button)
  * [Props](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#props)
    * [Props](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#props-1)
    * [With Attachments](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#with-attachments)
    * [Voice Input](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#voice-input)
  * [Features](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#features-1)
    * [Auto-resizing](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#auto-resizing)
    * [File Attachments](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#file-attachments)
    * [Submit Behavior](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#submit-behavior)
    * [Generation Control](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#generation-control)
    * [Interrupt Behavior](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#interrupt-behavior)
  * [Theming](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input#theming)


Built by [Blazity](https://twitter.com/blazity), based on a project by [shadcn](https://x.com/shadcn). The source code is available on [GitHub](https://github.com/Blazity/shadcn-chatbot-kit).

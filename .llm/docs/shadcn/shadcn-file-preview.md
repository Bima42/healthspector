[shadcn-chatbot-kit](https://shadcn-chatbot-kit.vercel.app/)[Demo](https://shadcn-chatbot-kit.vercel.app/demo)[Docs](https://shadcn-chatbot-kit.vercel.app/docs)[Components](https://shadcn-chatbot-kit.vercel.app/docs/components)[Themes](https://shadcn-chatbot-kit.vercel.app/themes)
Toggle Menu
Search documentation...Search...`⌘K`
[GitHub](https://github.com/Blazity/shadcn-chatbot-kit)[Twitter](https://twitter.com/blazity)Toggle theme
#### Getting Started
[Introduction](https://shadcn-chatbot-kit.vercel.app/docs)[Installation](https://shadcn-chatbot-kit.vercel.app/docs/installation)
#### Components
[Chat](https://shadcn-chatbot-kit.vercel.app/docs/components/chat)[Message Input](https://shadcn-chatbot-kit.vercel.app/docs/components/message-input)[Message List](https://shadcn-chatbot-kit.vercel.app/docs/components/message-list)[Chat Message](https://shadcn-chatbot-kit.vercel.app/docs/components/chat-message)[Markdown Renderer](https://shadcn-chatbot-kit.vercel.app/docs/components/markdown-renderer)[Prompt Suggestions](https://shadcn-chatbot-kit.vercel.app/docs/components/prompt-suggestions)[Typing Indicator](https://shadcn-chatbot-kit.vercel.app/docs/components/typing-indicator)[Copy Button](https://shadcn-chatbot-kit.vercel.app/docs/components/copy-button)[File Preview](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview)[Audio Visualizer](https://shadcn-chatbot-kit.vercel.app/docs/components/audio-visualizer)
Docs
File Preview
# File Preview
A component for previewing image and text files.
PreviewCode
Copy
Select Files
The FilePreview component provides a consistent way to display file previews with support for both image and text files.
##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview#installation)Installation
CLIManual
```
npx shadcn@latest add https://shadcn-chatbot-kit.vercel.app/r/file-preview.json
```

##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview#usage)Usage
```
import { FilePreview } from "@/registry/default/ui/file-preview"
export function FilePreviewDemo() {
  const [file, setFile] = useState<File | null>(null)
  return (
    <div>
      {file && <FilePreview file={file} onRemove={() => setFile(null)} />}
    </div>
  )
}
```

##  [](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview#props)Props
###  [](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview#filepreview)FilePreview
Prop | Type | Description  
---|---|---  
file | `File` | The file object to preview  
onRemove | `Function` | Callback function when remove is clicked  
[](https://shadcn-chatbot-kit.vercel.app/docs/components/copy-button)[Audio Visualizer](https://shadcn-chatbot-kit.vercel.app/docs/components/audio-visualizer)
On This Page
  * [Installation](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview#installation)
  * [Usage](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview#usage)
  * [Props](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview#props)
    * [FilePreview](https://shadcn-chatbot-kit.vercel.app/docs/components/file-preview#filepreview)


Built by [Blazity](https://twitter.com/blazity), based on a project by [shadcn](https://x.com/shadcn). The source code is available on [GitHub](https://github.com/Blazity/shadcn-chatbot-kit).

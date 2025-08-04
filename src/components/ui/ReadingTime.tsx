import { calculateReadingTimeFromPortableText } from '@/lib/utils'

interface ReadingTimeProps {
  content: any[]
  className?: string
}

export default function ReadingTime({ content, className = '' }: ReadingTimeProps) {
  const readingTime = calculateReadingTimeFromPortableText(content)
  
  // デバッグログ
  console.log('ReadingTime Debug:', {
    contentLength: content?.length,
    readingTime,
    hasContent: !!content
  })
  
  return (
    <div className={`flex items-center text-sm text-gray-600 mb-4 ${className}`}>
      <svg 
        className="w-4 h-4 mr-1.5 text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span>この記事は約 <strong className="text-gray-800">{readingTime}分</strong> で読めます</span>
    </div>
  )
}
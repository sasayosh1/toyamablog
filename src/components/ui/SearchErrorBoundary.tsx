'use client'

import React, { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onError?: () => void
}

interface State {
  hasError: boolean
}

export default class SearchErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Search Error Boundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError()
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center">
            <svg 
              className="w-5 h-5 text-red-400 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                検索機能でエラーが発生しました
              </h3>
              <p className="text-sm text-red-700 mt-1">
                検索を再試行するか、ページを更新してください。
              </p>
            </div>
            <button
              onClick={this.handleRetry}
              className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
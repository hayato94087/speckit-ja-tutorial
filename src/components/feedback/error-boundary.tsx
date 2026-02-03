'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * エラーバウンダリコンポーネント
 * 子コンポーネントでエラーが発生した場合にフォールバックUIを表示
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーログを出力（本番環境では外部サービスに送信）
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  handleClearAndRetry = (): void => {
    // localStorageをクリアしてリトライ
    try {
      localStorage.removeItem('todo-app-tasks')
    } catch {
      // localStorageへのアクセスに失敗した場合は無視
    }
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="flex flex-col items-center justify-center p-8 text-center"
          role="alert"
        >
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            エラーが発生しました
          </h2>
          <p className="mb-4 text-gray-600">
            アプリケーションで予期せぬエラーが発生しました。
          </p>
          <div className="flex gap-2">
            <Button onClick={this.handleRetry} variant="default">
              再試行
            </Button>
            <Button onClick={this.handleClearAndRetry} variant="outline">
              データをリセット
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-4 max-w-full overflow-auto rounded bg-gray-100 p-4 text-left text-sm text-red-600">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

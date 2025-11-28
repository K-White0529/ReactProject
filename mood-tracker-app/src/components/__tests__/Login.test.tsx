import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Login from '../Login'

describe('Login', () => {
  it('ログインフォームが表示される', () => {
    const mockOnLoginSuccess = vi.fn()
    const mockOnSwitchToRegister = vi.fn()

    render(
      <Login
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    )

    expect(screen.getByLabelText(/ユーザー名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument()
  })

  it('新規登録リンクをクリックすると、onSwitchToRegisterが呼ばれる', () => {
    const mockOnLoginSuccess = vi.fn()
    const mockOnSwitchToRegister = vi.fn()

    render(
      <Login
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    )

    const registerLink = screen.getByRole('button', { name: /新規登録はこちら/i })
    fireEvent.click(registerLink)

    expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1)
  })
})
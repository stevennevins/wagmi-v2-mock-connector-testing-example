import {renderWithProviders} from "../test"
import { act } from '@testing-library/react'
import { describe, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('should render', async () => {
    await act(async () => {
      renderWithProviders(<App />)
    })
  })
})
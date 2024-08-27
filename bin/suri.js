#!/usr/bin/env node

import process from 'node:process'
import main from '../src/main.js'

try {
  await main()
} catch (error) {
  console.error(`Error: ${error.message}`)

  if (error.cause) {
    console.error(`  ↳ ${error.cause.message}`)
  }

  process.exitCode = 1
}

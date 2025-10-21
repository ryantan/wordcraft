/**
 * Demo Script: OpenAI Story Generation
 * 
 * This script demonstrates the OpenAI story generation capabilities
 * Run with: npx tsx scripts/demo-story-generation.ts
 */

import { generateStoryAsync } from '@/lib/story/story-generator'
import type { StoryGenerationInput } from '@/types/story'

async function demoStoryGeneration() {
  console.log('🚀 WordCraft OpenAI Story Generation Demo\n')

  const demoInputs: StoryGenerationInput[] = [
    {
      wordList: ['rocket', 'space', 'alien'],
      theme: 'space',
      targetBeats: 8,
    },
    {
      wordList: ['treasure', 'map', 'pirate', 'island'],
      theme: 'treasure',
      targetBeats: 10,
    },
    {
      wordList: ['wizard', 'dragon', 'castle'],
      theme: 'fantasy',
      targetBeats: 6,
    },
  ]

  for (const input of demoInputs) {
    console.log(`\n📖 Generating ${input.theme} story with words: ${input.wordList.join(', ')}`)
    console.log('─'.repeat(60))

    try {
      const startTime = Date.now()
      const story = await generateStoryAsync(input)
      const duration = Date.now() - startTime

      console.log(`✅ Generated story in ${duration}ms`)
      console.log(`📊 Story contains ${story.stage1Beats.length} beats`)

      // Show story structure
      const beatTypes = story.stage1Beats.reduce((acc, beat) => {
        acc[beat.type] = (acc[beat.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      console.log('📋 Beat breakdown:')
      Object.entries(beatTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`)
      })

      // Show first few beats as preview
      console.log('\n🎬 Story preview (first 3 beats):')
      story.stage1Beats.slice(0, 3).forEach((beat, index) => {
        console.log(`\n   ${index + 1}. [${beat.type.toUpperCase()}] ${beat.id}`)
        console.log(`      "${beat.narrative}"`)
        
        if (beat.type === 'game') {
          console.log(`      Word: ${beat.word} | Game: ${beat.gameType}`)
        } else if (beat.type === 'choice') {
          console.log(`      Question: ${beat.question}`)
          console.log(`      Options: ${beat.options.join(' | ')}`)
        }
      })

      // Check word coverage
      const gameBeats = story.stage1Beats.filter(beat => beat.type === 'game')
      const coveredWords = gameBeats.map(beat => 
        beat.type === 'game' ? beat.word : null
      ).filter(Boolean)

      console.log(`\n🎯 Word coverage: ${coveredWords.length}/${input.wordList.length}`)
      input.wordList.forEach(word => {
        const covered = coveredWords.includes(word)
        console.log(`   ${covered ? '✅' : '❌'} ${word}`)
      })

    } catch (error) {
      console.error(`❌ Failed to generate story:`, error)
    }
  }

  console.log('\n🏁 Demo completed!')
  console.log('\nTo enable OpenAI story generation:')
  console.log('1. Set OPENAI_API_KEY in your .env.local file')
  console.log('2. Set NEXT_PUBLIC_ENABLE_OPENAI_STORIES=true')
  console.log('3. Restart your development server')
}

// Performance comparison demo
async function performanceComparison() {
  console.log('\n⚡ Performance Comparison: Template vs OpenAI\n')

  const testInput: StoryGenerationInput = {
    wordList: ['test', 'word', 'list'],
    theme: 'space',
    targetBeats: 6,
  }

  // Template generation (multiple runs for average)
  const templateTimes: number[] = []
  for (let i = 0; i < 5; i++) {
    const startTime = Date.now()
    await generateStoryAsync(testInput) // Will use template fallback
    templateTimes.push(Date.now() - startTime)
  }

  const avgTemplateTime = templateTimes.reduce((a, b) => a + b, 0) / templateTimes.length

  console.log(`📊 Template Generation (avg of 5 runs): ${avgTemplateTime.toFixed(1)}ms`)
  console.log(`📊 Range: ${Math.min(...templateTimes)}ms - ${Math.max(...templateTimes)}ms`)

  console.log('\n💡 OpenAI generation would typically take 1000-3000ms')
  console.log('💡 But provides unique, contextual stories for each session')
}

// Feature showcase
function showFeatures() {
  console.log('\n🌟 OpenAI Story Generation Features:\n')

  const features = [
    '✨ Dynamic story generation for any word list and theme',
    '🎯 Contextual narratives that reference specific words',
    '🔄 Unique stories for each session (no repetition)',
    '📚 Age-appropriate educational content',
    '🎮 Proper beat structure (narrative, game, choice, checkpoint)',
    '⚡ Fast 3-second timeout with template fallback',
    '🛡️ Content validation and quality assurance',
    '📊 Performance monitoring and metrics',
    '🏗️ Backward compatible with existing story mode',
    '🎛️ Feature flag controlled (easy enable/disable)',
  ]

  features.forEach(feature => console.log(feature))
}

// Main execution
async function main() {
  showFeatures()
  await demoStoryGeneration()
  await performanceComparison()
}

if (require.main === module) {
  main().catch(console.error)
}

export { demoStoryGeneration, performanceComparison, showFeatures }
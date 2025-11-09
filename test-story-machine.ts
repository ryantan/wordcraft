/**
 * Manual test script for StorySessionMachine
 * Run with: npx tsx test-story-machine.ts
 */

import { createActor } from 'xstate';

import { storySessionMachine } from './machines/story/storySessionMachine';

// Create test word list
const testWordList = {
  id: 'test-story',
  name: 'Test Words',
  description: 'Test word list',
  words: ['CAT', 'DOG', 'BIRD'],
  createdAt: new Date(),
  lastModifiedAt: new Date(),
  updatedAt: new Date(),
};

// Create actor (machine instance)
const actor = createActor(storySessionMachine, {
  input: {
    wordList: testWordList,
    theme: 'space',
    wordListId: 'test-story',
    hasSeenIntro: false,
  },
});

// Subscribe to state changes
actor.subscribe(state => {
  console.log('\n=== State Change ===');
  console.log('State:', state.value);
  console.log('Current Beat:', state.context.currentBeat?.type);
  console.log('Beat Index:', state.context.currentBeatIndex);
  console.log('Word Stats Size:', state.context.wordStats.size);
});

// Start the machine
actor.start();

// Test state transitions
console.log('\n🚀 Testing Story Machine...\n');

// Should start at showingIntro
setTimeout(() => {
  console.log('\n📖 Starting story...');
  actor.send({ type: 'START_STORY' });
}, 1000);

// Simulate completing a game
setTimeout(() => {
  console.log('\n🎮 Completing a game...');
  actor.send({
    type: 'GAME_COMPLETED',
    result: {
      isCorrect: true,
      timeSpent: 5000,
      hintsUsed: 0,
      errors: 0,
    },
  });
}, 3000);

// Continue through narrative
setTimeout(() => {
  console.log('\n📖 Continuing narrative...');
  actor.send({ type: 'NARRATIVE_SEEN' });
}, 4000);

// Check finale condition
setTimeout(() => {
  console.log('\n🏁 Checking finale state...');
  console.log('Final state:', actor.getSnapshot().value);
  console.log('Word stats:', Array.from(actor.getSnapshot().context.wordStats.entries()));
  actor.stop();
}, 6000);

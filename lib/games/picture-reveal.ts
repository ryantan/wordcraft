/**
 * Picture Reveal Game Mechanic
 */

import { PictureReveal } from '@/components/games/PictureReveal';
import type { GameMechanic } from '@/types';

export const pictureRevealMechanic: GameMechanic = {
  meta: {
    id: 'picture-reveal',
    name: 'Picture Reveal',
    description: 'Reveal a hidden picture by spelling letters correctly',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: PictureReveal,
};

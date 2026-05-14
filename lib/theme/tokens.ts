/**
 * Animation tokens. Calm/soothing for dog-friendly motion (NOT bouncy/Bluey).
 * Component code references these so changes propagate everywhere.
 */
type Bezier = [number, number, number, number];

export const easings: { gentle: Bezier; swing: Bezier } = {
  gentle: [0.22, 1, 0.36, 1],
  swing: [0.4, 0, 0.2, 1],
};

export const durations = {
  fast: 0.25,
  base: 0.5,
  slow: 0.9,
};

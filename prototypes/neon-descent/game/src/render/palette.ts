/**
 * VERGE-36 (ART-DIRECTION.md §1). Thirty-six colors, eight ramps, nothing else
 * ships. Color is semantic: BLOOD only ever means threat, ACID only ever means
 * data. The palette is a language the player learns in Act I.
 */

export const P: Record<string, string> = {
  // VOID — shadow, unexplored, letterbox
  '0': '#05030d', '1': '#0d0a1f', '2': '#171236', '3': '#241a52', '4': '#33266f',
  // STEEL — architecture, machinery
  a: '#14161f', b: '#23283a', c: '#3a4257', d: '#566076', e: '#7c869c', f: '#aab4c7',
  // FLESH
  g: '#3d1c2b', h: '#6e3342', i: '#a85a5c', j: '#d68d76', k: '#f0c3a4',
  // CYAN — interface, data, loot
  l: '#06323f', m: '#0c6f80', n: '#1fc3d6', o: '#7df2ff',
  // MAGENTA — you
  p: '#46082f', q: '#9b1067', r: '#ee2b8e', s: '#ff8ecd',
  // ACID — intrusion, data, power
  t: '#0b3418', u: '#1c8038', v: '#46dc63', w: '#b2ffbc',
  // SODIUM — hazard, fire
  x: '#45210a', y: '#9c5010', z: '#ee9320', A: '#ffcf78',
  // BLOOD — damage, alert
  B: '#4a0510', C: '#c01228', D: '#ff3b52',
  // LIGHT
  L: '#e9f1ff',
};

/** Fixed semantic roles. Referenced by name so the meanings stay honest. */
export const SEM = {
  you: P.r,
  threat: P.D,
  threatDim: P.C,
  data: P.v,
  interactive: P.n,
  hazard: P.z,
  void: P['0'],
  text: P.e,
  textBright: P.L,
};

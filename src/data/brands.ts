/**
 * The brands the company supplies, as the client listed them. Shown as names, not logos: a maker's logo is theirs to
 * allow. Nothing here says "authorised dealer" - add that only when the client confirms it for a brand.
 */
export const PANEL_BRANDS = ['Tata Power Solar', 'Waaree', 'Adani Solar', 'Luminous', 'Vikram Solar', 'Avaada'] as const;

export const INVERTER_BRANDS = ['Polycab', 'Luminous', 'Deye', 'Selec', 'SolaX', 'Solis', 'GoodWe'] as const;

export const PANEL_KINDS = [
  {
    name: 'DCR panels',
    text: 'Domestic Content Requirement panels are made with solar cells manufactured in India. Some government schemes ask for DCR panels.',
  },
  {
    name: 'Non-DCR panels',
    text: 'Panels that may use imported cells. They suit installations where DCR is not required.',
  },
] as const;

export const INVERTER_KINDS = [
  {
    name: 'Single-phase inverters',
    text: 'For single-phase connections - most homes and small shops.',
  },
  {
    name: 'Three-phase inverters',
    text: 'For three-phase connections - larger homes, businesses, schools and factories.',
  },
] as const;

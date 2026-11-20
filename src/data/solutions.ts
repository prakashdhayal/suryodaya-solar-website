/**
 * The five solutions - the cards on the home page and Solar Solutions, and a page each (/solar-solutions/<slug>/).
 * The words explain how each system works and who it suits; they make no promise about prices, savings, subsidies,
 * warranties or timelines (none has been given to us).
 */
import type { ImageMetadata } from 'astro';
import commercialRoof from '../assets/site/commercial-rooftop-solar.jpg';
import groundMounted from '../assets/site/ground-mounted-solar-panels.jpg';
import rooftop from '../assets/site/rooftop-panel-installation.jpg';
import panelRows from '../assets/site/solar-panel-rows.jpg';
import plantAtDusk from '../assets/site/solar-plant-at-dusk.jpg';

export type SystemType = 'On-Grid' | 'Off-Grid' | 'Hybrid';
export type Requirement = 'Residential' | 'Commercial';
export type IconName = 'grid' | 'battery' | 'hybrid' | 'home' | 'building';

export interface Solution {
  slug: string;
  /** The card's and the menu's name. */
  name: string;
  icon: IconName;
  /** Two lines on a card. */
  summary: string;
  /** <title> (under ~60 characters) and meta description (~150). */
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  image: { src: ImageMetadata; alt: string };
  sections: { heading: string; paragraphs?: string[]; list?: string[] }[];
  suits: string[];
  faqs: { q: string; a: string }[];
  /** The enquiry form's heading on the page. */
  quoteHeading: string;
  /** What the enquiry form on the page starts with. */
  preset: { system?: SystemType; requirement?: Requirement };
}

export const SOLUTIONS: Solution[] = [
  {
    slug: 'on-grid-solar-system',
    name: 'On-Grid Solar System',
    icon: 'grid',
    summary: 'Works with your electricity connection. No batteries - power you do not use goes to the grid.',
    title: 'On-Grid Solar System in Ajmer | Suryodaya Solar Power',
    description:
      'On-grid (grid-tied) solar system installation in Ajmer for homes and businesses: how it works, net metering, single- and three-phase inverters. Enquire today.',
    eyebrow: 'On-grid solar',
    h1: 'On-Grid Solar System Installation in Ajmer',
    lead: 'An on-grid system runs alongside your electricity connection. The panels power your place by day, and the grid covers the rest - no batteries needed.',
    image: { src: panelRows, alt: 'Rows of solar panels on mounting structures' },
    sections: [
      {
        heading: 'How an on-grid system works',
        paragraphs: [
          'Solar panels make direct current (DC) from sunlight. An on-grid inverter turns it into alternating current (AC) in step with the electricity supply, so your lights, fans and machines use solar power first.',
          'When the panels make more than you are using, the extra flows out to the grid. When they make less - in the evening or on a cloudy day - the grid supplies the difference. A net meter, arranged with the electricity distribution company (AVVNL in Ajmer), records the units in both directions.',
        ],
      },
      {
        heading: 'Good to know before you choose',
        list: [
          'No batteries, so there is less to maintain and nothing to replace on a battery cycle.',
          'An on-grid inverter switches off during a power cut, for the safety of people working on the lines. It does not give backup - for that, see the hybrid system.',
          'The inverter matches your connection: single-phase for most homes, three-phase for larger homes and businesses.',
          'Net metering is applied for with the electricity distribution company and follows its rules.',
        ],
      },
      {
        heading: 'What goes into the system',
        list: [
          'Solar panels - DCR or non-DCR, from the brands we supply',
          'On-grid inverter, single-phase or three-phase',
          'Mounting structure for your roof or ground',
          'DC and AC cabling with protection boxes, earthing and a lightning arrester',
          'Net meter (through the electricity distribution company)',
        ],
      },
    ],
    suits: [
      'Homes and businesses with a regular grid supply',
      'Anyone who wants to use less power from the grid',
      'Places where power cuts are rare or already covered by an inverter or generator',
    ],
    faqs: [
      { q: 'Does an on-grid system work during a power cut?', a: 'No. It switches off when the grid goes down, for the safety of line workers. If you need power during cuts, a hybrid system with batteries is the right choice.' },
      { q: 'Do I need batteries?', a: 'No. An on-grid system uses the grid in place of batteries: extra power goes out to it, and you draw from it when the panels are not enough.' },
      { q: 'Single-phase or three-phase inverter?', a: 'It follows your electricity connection. Most homes have a single-phase connection; larger homes, shops and factories often have three-phase. Your electricity bill shows which one you have.' },
      { q: 'What is the difference between DCR and non-DCR panels?', a: 'DCR (Domestic Content Requirement) panels are made with solar cells manufactured in India; some government schemes ask for them. Non-DCR panels may use imported cells. We supply both - ask us which one your installation needs.' },
    ],
    quoteHeading: 'Get a quote for an on-grid solar system',
    preset: { system: 'On-Grid' },
  },
  {
    slug: 'off-grid-solar-system',
    name: 'Off-Grid Solar System',
    icon: 'battery',
    summary: 'Panels and batteries that run on their own - for places with no grid or an unreliable one.',
    title: 'Off-Grid Solar System in Ajmer | Suryodaya Solar Power',
    description:
      'Off-grid solar system installation in Ajmer: solar panels with batteries for farms, remote sites and places without a reliable grid. Call or WhatsApp us.',
    eyebrow: 'Off-grid solar',
    h1: 'Off-Grid Solar System Installation in Ajmer',
    lead: 'An off-grid system does not need an electricity connection at all. The panels charge batteries by day, and the batteries keep your power on at night.',
    image: { src: groundMounted, alt: 'Ground-mounted solar panels beside trees' },
    sections: [
      {
        heading: 'How an off-grid system works',
        paragraphs: [
          'The panels charge a battery bank through a solar inverter with a charge controller. The inverter then supplies AC power to your lights, fans and appliances - from the panels while the sun is up, and from the batteries after dark.',
          'Because nothing is connected to the grid, there is no electricity bill for the power the system makes and no net meter. It also means the system has to be sized for everything you want to run, including at night.',
        ],
      },
      {
        heading: 'Good to know before you choose',
        list: [
          'Sizing depends on what you run and for how long - especially after sunset. A list of your appliances and their hours is the best starting point.',
          'Batteries are a large part of the system. They wear with use and are replaced during the system’s life; the battery type affects how often.',
          'Spare power on a sunny day cannot be sent to the grid, so the system is sized to your own use.',
          'Several cloudy days in a row draw the batteries down; a backup source can be planned for when that matters.',
        ],
      },
      {
        heading: 'What goes into the system',
        list: [
          'Solar panels - DCR or non-DCR',
          'Off-grid solar inverter with charge controller, single-phase or three-phase',
          'Battery bank sized to your night-time use',
          'Mounting structure, cabling, protection boxes and earthing',
        ],
      },
    ],
    suits: [
      'Farms, farmhouses and remote sites',
      'Places where the grid has not reached or supply is unreliable',
      'Sites that need power without waiting for a new connection',
    ],
    faqs: [
      { q: 'Can an off-grid system run everything in my house?', a: 'It can be sized for the loads you choose. Heavy loads like air conditioners or motors need a larger inverter and battery bank, so we start from the list of what you want to run.' },
      { q: 'What happens on cloudy days?', a: 'The panels still make some power, and the batteries cover the rest. Over several cloudy days the batteries run down, so the size of the battery bank - or a backup source - matters.' },
      { q: 'Can I connect it to the grid later?', a: 'An off-grid inverter is not made to export power. If a grid connection is coming, a hybrid system gives you batteries now and works with the grid later.' },
    ],
    quoteHeading: 'Get a quote for an off-grid solar system',
    preset: { system: 'Off-Grid' },
  },
  {
    slug: 'hybrid-solar-system',
    name: 'Hybrid Solar System',
    icon: 'hybrid',
    summary: 'Grid, panels and batteries together - backup during power cuts, grid connection the rest of the time.',
    title: 'Hybrid Solar System in Ajmer | Suryodaya Solar Power',
    description:
      'Hybrid solar system installation in Ajmer: solar panels, batteries and the grid working together for backup during power cuts. Get a free quote.',
    eyebrow: 'Hybrid solar',
    h1: 'Hybrid Solar System Installation in Ajmer',
    lead: 'A hybrid system works with the grid like an on-grid system, and keeps batteries for power cuts like an off-grid one.',
    image: { src: plantAtDusk, alt: 'Solar panels in front of a building at dusk' },
    sections: [
      {
        heading: 'How a hybrid system works',
        paragraphs: [
          'A hybrid inverter manages three sources at once: the solar panels, a battery bank and the grid. By day the panels run your place and charge the batteries; extra power can go to the grid where net metering is in place.',
          'When the grid goes down, the inverter switches the chosen loads to the batteries and panels, so your essentials stay on. When the grid comes back, it takes over again and the batteries recharge.',
        ],
      },
      {
        heading: 'Good to know before you choose',
        list: [
          'You choose which loads are backed up - lights, fans, a fridge, computers, a pump - and the battery bank is sized for them.',
          'With batteries and a hybrid inverter, it costs more than an on-grid system of the same size.',
          'Batteries wear with use and are replaced during the system’s life.',
          'Exporting power to the grid follows the electricity distribution company’s net metering rules.',
        ],
      },
      {
        heading: 'What goes into the system',
        list: [
          'Solar panels - DCR or non-DCR',
          'Hybrid inverter, single-phase or three-phase',
          'Battery bank for the loads you want backed up',
          'Mounting structure, cabling, protection boxes, earthing and a lightning arrester',
          'Net meter, where power is exported',
        ],
      },
    ],
    suits: [
      'Homes and businesses with frequent power cuts',
      'Clinics, offices and shops that cannot stop when the power goes',
      'Anyone who wants grid connection and backup in one system',
    ],
    faqs: [
      { q: 'How long will the batteries keep my power on?', a: 'It depends on the size of the battery bank and the loads you back up. Tell us what must stay on and for how long, and the batteries are sized for that.' },
      { q: 'Is a hybrid system better than on-grid?', a: 'Not always - it is the better choice when power cuts matter to you. If cuts are rare, an on-grid system does the same job by day for less.' },
      { q: 'Can I add batteries to an existing on-grid system?', a: 'An on-grid inverter cannot use batteries. Adding backup usually means changing to a hybrid inverter or adding a battery inverter - share your current system details and we will tell you what fits.' },
    ],
    quoteHeading: 'Get a quote for a hybrid solar system',
    preset: { system: 'Hybrid' },
  },
  {
    slug: 'residential-solar',
    name: 'Domestic Solar Plants',
    icon: 'home',
    summary: 'Rooftop solar for houses and villas - on-grid, off-grid or hybrid, sized to your home.',
    title: 'Residential Solar Installation in Ajmer | Suryodaya Solar',
    description:
      'Domestic rooftop solar plant installation in Ajmer for houses and villas: on-grid, off-grid and hybrid systems with leading panel and inverter brands.',
    eyebrow: 'Domestic solar plants',
    h1: 'Residential Solar Installation in Ajmer',
    lead: 'A rooftop solar plant for your home, sized to the power your family uses and the roof you have.',
    image: { src: rooftop, alt: 'A solar panel being fitted on a house roof' },
    sections: [
      {
        heading: 'Choosing the right system for your home',
        list: [
          'On-grid - for homes with a regular supply that want to use less power from the grid.',
          'Hybrid - for homes with frequent power cuts that want backup as well.',
          'Off-grid - for farmhouses and homes where the grid has not reached.',
        ],
      },
      {
        heading: 'How a home system is sized',
        paragraphs: [
          'The units (kWh) on your electricity bills show how much power your home uses over the year. That, the shadow-free space on your roof and your connection type - single-phase or three-phase - decide the size of the plant and the inverter.',
          'Flat concrete roofs and sheet roofs take different mounting structures, and the structure is planned so that the panels face the sun and stay clear of water tanks and shadows.',
        ],
      },
      {
        heading: 'What to share with us',
        list: [
          'Your last few electricity bills (a photo is enough)',
          'Photos of your roof',
          'Whether you want backup during power cuts',
          'Your location in or around Ajmer',
        ],
      },
    ],
    suits: ['Independent houses and villas', 'Farmhouses', 'Homes with a flat concrete or sheet roof'],
    faqs: [
      { q: 'What size of solar plant does my home need?', a: 'It depends on how many units your home uses and how much shadow-free roof you have. Send us your recent bills and roof photos and we will suggest a size.' },
      { q: 'Will solar work with my single-phase connection?', a: 'Yes. Single-phase homes use a single-phase inverter; three-phase homes use a three-phase one. We supply both.' },
      { q: 'Do I get power during a power cut?', a: 'Only with a hybrid or off-grid system, which have batteries. An on-grid system switches off when the grid is down.' },
    ],
    quoteHeading: 'Get a quote for your home',
    preset: { requirement: 'Residential' },
  },
  {
    slug: 'commercial-solar',
    name: 'Commercial Solar Plants',
    icon: 'building',
    summary: 'Solar for shops, offices, schools, hospitals and factories - usually three-phase, on roof or ground.',
    title: 'Commercial Solar Installation in Ajmer | Suryodaya Solar',
    description:
      'Commercial solar plant installation in Ajmer for shops, offices, schools, hospitals, hotels and factories: on-grid, hybrid and off-grid, three-phase.',
    eyebrow: 'Commercial solar plants',
    h1: 'Commercial Solar Installation in Ajmer',
    lead: 'Businesses use most of their power in daylight - when solar panels make it. A commercial plant is planned around your working hours and your connection.',
    image: { src: commercialRoof, alt: 'Solar panels across a large commercial roof at sunrise' },
    sections: [
      {
        heading: 'For every kind of business',
        list: [
          'Shops and showrooms',
          'Offices and banks',
          'Schools, colleges and coaching centres',
          'Hospitals and clinics',
          'Hotels and restaurants',
          'Factories, workshops and warehouses',
        ],
      },
      {
        heading: 'How a commercial plant is planned',
        paragraphs: [
          'Most commercial connections are three-phase, so commercial plants use three-phase inverters - one or several, depending on the size. The plant can sit on the roof, on a shed or on open ground.',
          'Your sanctioned load, a year of electricity bills, the roof or land available and your working hours decide the size. An on-grid plant suits most businesses; a hybrid plant keeps essential loads running through power cuts.',
        ],
      },
      {
        heading: 'What to share with us',
        list: [
          'Electricity bills for the last 12 months',
          'Roof or land details, with photos',
          'Your working hours and any loads that must not stop',
          'Your connection type and sanctioned load',
        ],
      },
    ],
    suits: ['Businesses that work in daylight hours', 'Buildings with large roofs or sheds', 'Sites with heavy three-phase loads'],
    faqs: [
      { q: 'Which system suits a business?', a: 'On-grid suits most businesses with a steady grid supply. If power cuts stop your work, a hybrid plant keeps the essential loads running.' },
      { q: 'Can the panels go on a tin shed?', a: 'Yes - sheet roofs take their own mounting structure. Share photos of the shed and we will tell you what fits.' },
      { q: 'Which inverter brands do you supply for three-phase plants?', a: 'We deal in three-phase inverters from Polycab, Luminous, Deye, Selec, SolaX, Solis and GoodWe. See Products & Brands.' },
    ],
    quoteHeading: 'Get a quote for your business',
    preset: { requirement: 'Commercial' },
  },
];

export const SYSTEM_TYPES: SystemType[] = ['On-Grid', 'Off-Grid', 'Hybrid'];
export const REQUIREMENTS: Requirement[] = ['Residential', 'Commercial'];

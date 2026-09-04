'use client';

import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import {
  BankOutlined,
  CheckCircleFilled,
  ClusterOutlined,
  CloudServerOutlined,
  CompassOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  InboxOutlined,
  LinkOutlined,
  LoginOutlined,
  MailOutlined,
  MinusOutlined,
  PhoneOutlined,
  PlusOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SendOutlined,
  ShopOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  TruckOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  ConfigProvider,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Progress,
  Radio,
  Result,
  Row,
  Segmented,
  Select,
  Slider,
  Space,
  Statistic,
  Steps,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

type PageKey = 'home' | 'quote' | 'tracking' | 'book' | 'login';
type ItemKey =
  | 'carryOn'
  | 'checked'
  | 'oversize'
  | 'box'
  | 'golf'
  | 'ski'
  | 'envelope';
type SpeedKey = 'standard' | 'nextDay' | 'sameDay';
type CustomerType = 'individual' | 'business';
type CarrierKey = 'best' | 'ups' | 'fedex';
type CarrierProvider = 'ups' | 'fedex';
type TrackingCarrier = CarrierProvider | 'auto';

type QuoteState = {
  counts: Record<ItemKey, number>;
  originState: string;
  destinationState: string;
  pickupDate: string;
  pickupWindow: string;
  speed: SpeedKey;
  protection: boolean;
  pickup: boolean;
  residential: boolean;
  couponCode?: string;
  declaredValue: number;
  customerType: CustomerType;
  carrier: CarrierKey;
};

type BookingState = {
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  notes: string;
};

type QuoteContactState = {
  shipperName: string;
  shipperEmail: string;
  shipperPhone: string;
  pickupStreet: string;
  pickupUnit: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  deliveryStreet: string;
  deliveryUnit: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryInstructions: string;
};

type USLocation = {
  code: string;
  name: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  region: string;
  remote?: boolean;
};

type ItemDefinition = {
  label: string;
  sublabel: string;
  max: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  icon: ReactNode;
  oversize?: boolean;
};

type CarrierRate = {
  key: CarrierProvider;
  name: string;
  service: string;
  total: number;
  base: number;
  transportation: number;
  fuel: number;
  accessorials: number;
  protection: number;
  discount: number;
  couponDiscount?: number;
  transit: string;
  deliveryDate: string;
  trackingUrl: string;
};

type QuoteMetrics = {
  packages: number;
  actualWeight: number;
  billableWeight: number;
  dimWeight: number;
  distanceMiles: number;
  zone: number;
  origin: USLocation;
  destination: USLocation;
  routeLabel: string;
  selectedCarrier: CarrierProvider;
  total: number;
  savings: number;
  eta: string;
  service: string;
  protectionFee: number;
  pickupFee: number;
  residentialFee: number;
  remoteFee: number;
  rates: Record<CarrierProvider, CarrierRate>;
  availabilityNote: string;
};

type Shipment = {
  number: string;
  carrier: TrackingCarrier;
  status: string;
  progress: number;
  origin: string;
  destination: string;
  mode: string;
  eta: string;
  pieces: string;
  documents: string[];
  exception?: string;
  trackingLinks: Array<{
    carrier: CarrierProvider;
    label: string;
    url: string;
  }>;
  milestones: Array<{
    title: string;
    detail: string;
    done: boolean;
  }>;
};

type NormalizedTrackingInput = {
  raw: string;
  trackingNumber: string;
  carrier: TrackingCarrier;
  isCarrierPage: boolean;
};

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(input: unknown): object | Promise<object>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
};

declare global {
  interface Document {
    modelContext?: {
      registerTool?: (
        tool: WebMcpTool,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

const usLocations: USLocation[] = [
  {
    code: 'AL',
    name: 'Alabama',
    city: 'Birmingham',
    zip: '35203',
    lat: 33.5186,
    lng: -86.8104,
    region: 'Southeast',
  },
  {
    code: 'AK',
    name: 'Alaska',
    city: 'Anchorage',
    zip: '99501',
    lat: 61.2176,
    lng: -149.8997,
    region: 'Non-contiguous',
    remote: true,
  },
  {
    code: 'AZ',
    name: 'Arizona',
    city: 'Phoenix',
    zip: '85004',
    lat: 33.4484,
    lng: -112.074,
    region: 'Southwest',
  },
  {
    code: 'AR',
    name: 'Arkansas',
    city: 'Little Rock',
    zip: '72201',
    lat: 34.7465,
    lng: -92.2896,
    region: 'South',
  },
  {
    code: 'CA',
    name: 'California',
    city: 'Los Angeles',
    zip: '90045',
    lat: 33.9416,
    lng: -118.4085,
    region: 'West',
  },
  {
    code: 'CO',
    name: 'Colorado',
    city: 'Denver',
    zip: '80202',
    lat: 39.7392,
    lng: -104.9903,
    region: 'Mountain',
  },
  {
    code: 'CT',
    name: 'Connecticut',
    city: 'Hartford',
    zip: '06103',
    lat: 41.7658,
    lng: -72.6734,
    region: 'Northeast',
  },
  {
    code: 'DE',
    name: 'Delaware',
    city: 'Wilmington',
    zip: '19801',
    lat: 39.7391,
    lng: -75.5398,
    region: 'Mid-Atlantic',
  },
  {
    code: 'DC',
    name: 'District of Columbia',
    city: 'Washington',
    zip: '20001',
    lat: 38.9072,
    lng: -77.0369,
    region: 'Mid-Atlantic',
  },
  {
    code: 'FL',
    name: 'Florida',
    city: 'Miami',
    zip: '33131',
    lat: 25.7617,
    lng: -80.1918,
    region: 'Southeast',
  },
  {
    code: 'GA',
    name: 'Georgia',
    city: 'Atlanta',
    zip: '30303',
    lat: 33.749,
    lng: -84.388,
    region: 'Southeast',
  },
  {
    code: 'HI',
    name: 'Hawaii',
    city: 'Honolulu',
    zip: '96813',
    lat: 21.3069,
    lng: -157.8583,
    region: 'Non-contiguous',
    remote: true,
  },
  {
    code: 'ID',
    name: 'Idaho',
    city: 'Boise',
    zip: '83702',
    lat: 43.615,
    lng: -116.2023,
    region: 'Mountain',
  },
  {
    code: 'IL',
    name: 'Illinois',
    city: 'Chicago',
    zip: '60601',
    lat: 41.8781,
    lng: -87.6298,
    region: 'Midwest',
  },
  {
    code: 'IN',
    name: 'Indiana',
    city: 'Indianapolis',
    zip: '46204',
    lat: 39.7684,
    lng: -86.1581,
    region: 'Midwest',
  },
  {
    code: 'IA',
    name: 'Iowa',
    city: 'Des Moines',
    zip: '50309',
    lat: 41.5868,
    lng: -93.625,
    region: 'Midwest',
  },
  {
    code: 'KS',
    name: 'Kansas',
    city: 'Wichita',
    zip: '67202',
    lat: 37.6872,
    lng: -97.3301,
    region: 'Midwest',
  },
  {
    code: 'KY',
    name: 'Kentucky',
    city: 'Louisville',
    zip: '40202',
    lat: 38.2527,
    lng: -85.7585,
    region: 'South',
  },
  {
    code: 'LA',
    name: 'Louisiana',
    city: 'New Orleans',
    zip: '70112',
    lat: 29.9511,
    lng: -90.0715,
    region: 'South',
  },
  {
    code: 'ME',
    name: 'Maine',
    city: 'Portland',
    zip: '04101',
    lat: 43.6591,
    lng: -70.2568,
    region: 'Northeast',
  },
  {
    code: 'MD',
    name: 'Maryland',
    city: 'Baltimore',
    zip: '21202',
    lat: 39.2904,
    lng: -76.6122,
    region: 'Mid-Atlantic',
  },
  {
    code: 'MA',
    name: 'Massachusetts',
    city: 'Boston',
    zip: '02108',
    lat: 42.3601,
    lng: -71.0589,
    region: 'Northeast',
  },
  {
    code: 'MI',
    name: 'Michigan',
    city: 'Detroit',
    zip: '48226',
    lat: 42.3314,
    lng: -83.0458,
    region: 'Midwest',
  },
  {
    code: 'MN',
    name: 'Minnesota',
    city: 'Minneapolis',
    zip: '55401',
    lat: 44.9778,
    lng: -93.265,
    region: 'Midwest',
  },
  {
    code: 'MS',
    name: 'Mississippi',
    city: 'Jackson',
    zip: '39201',
    lat: 32.2988,
    lng: -90.1848,
    region: 'South',
  },
  {
    code: 'MO',
    name: 'Missouri',
    city: 'Kansas City',
    zip: '64106',
    lat: 39.0997,
    lng: -94.5786,
    region: 'Midwest',
  },
  {
    code: 'MT',
    name: 'Montana',
    city: 'Billings',
    zip: '59101',
    lat: 45.7833,
    lng: -108.5007,
    region: 'Mountain',
  },
  {
    code: 'NE',
    name: 'Nebraska',
    city: 'Omaha',
    zip: '68102',
    lat: 41.2565,
    lng: -95.9345,
    region: 'Midwest',
  },
  {
    code: 'NV',
    name: 'Nevada',
    city: 'Las Vegas',
    zip: '89101',
    lat: 36.1699,
    lng: -115.1398,
    region: 'West',
  },
  {
    code: 'NH',
    name: 'New Hampshire',
    city: 'Manchester',
    zip: '03101',
    lat: 42.9956,
    lng: -71.4548,
    region: 'Northeast',
  },
  {
    code: 'NJ',
    name: 'New Jersey',
    city: 'Newark',
    zip: '07102',
    lat: 40.7357,
    lng: -74.1724,
    region: 'Mid-Atlantic',
  },
  {
    code: 'NM',
    name: 'New Mexico',
    city: 'Albuquerque',
    zip: '87102',
    lat: 35.0844,
    lng: -106.6504,
    region: 'Southwest',
  },
  {
    code: 'NY',
    name: 'New York',
    city: 'New York',
    zip: '10001',
    lat: 40.7128,
    lng: -74.006,
    region: 'Northeast',
  },
  {
    code: 'NC',
    name: 'North Carolina',
    city: 'Charlotte',
    zip: '28202',
    lat: 35.2271,
    lng: -80.8431,
    region: 'Southeast',
  },
  {
    code: 'ND',
    name: 'North Dakota',
    city: 'Fargo',
    zip: '58102',
    lat: 46.8772,
    lng: -96.7898,
    region: 'Midwest',
  },
  {
    code: 'OH',
    name: 'Ohio',
    city: 'Columbus',
    zip: '43215',
    lat: 39.9612,
    lng: -82.9988,
    region: 'Midwest',
  },
  {
    code: 'OK',
    name: 'Oklahoma',
    city: 'Oklahoma City',
    zip: '73102',
    lat: 35.4676,
    lng: -97.5164,
    region: 'South',
  },
  {
    code: 'OR',
    name: 'Oregon',
    city: 'Portland',
    zip: '97204',
    lat: 45.5152,
    lng: -122.6784,
    region: 'West',
  },
  {
    code: 'PA',
    name: 'Pennsylvania',
    city: 'Philadelphia',
    zip: '19103',
    lat: 39.9526,
    lng: -75.1652,
    region: 'Mid-Atlantic',
  },
  {
    code: 'RI',
    name: 'Rhode Island',
    city: 'Providence',
    zip: '02903',
    lat: 41.824,
    lng: -71.4128,
    region: 'Northeast',
  },
  {
    code: 'SC',
    name: 'South Carolina',
    city: 'Charleston',
    zip: '29401',
    lat: 32.7765,
    lng: -79.9311,
    region: 'Southeast',
  },
  {
    code: 'SD',
    name: 'South Dakota',
    city: 'Sioux Falls',
    zip: '57104',
    lat: 43.5446,
    lng: -96.7311,
    region: 'Midwest',
  },
  {
    code: 'TN',
    name: 'Tennessee',
    city: 'Nashville',
    zip: '37219',
    lat: 36.1627,
    lng: -86.7816,
    region: 'South',
  },
  {
    code: 'TX',
    name: 'Texas',
    city: 'Dallas',
    zip: '75201',
    lat: 32.7767,
    lng: -96.797,
    region: 'South',
  },
  {
    code: 'UT',
    name: 'Utah',
    city: 'Salt Lake City',
    zip: '84101',
    lat: 40.7608,
    lng: -111.891,
    region: 'Mountain',
  },
  {
    code: 'VT',
    name: 'Vermont',
    city: 'Burlington',
    zip: '05401',
    lat: 44.4759,
    lng: -73.2121,
    region: 'Northeast',
  },
  {
    code: 'VA',
    name: 'Virginia',
    city: 'Richmond',
    zip: '23219',
    lat: 37.5407,
    lng: -77.436,
    region: 'Mid-Atlantic',
  },
  {
    code: 'WA',
    name: 'Washington',
    city: 'Seattle',
    zip: '98101',
    lat: 47.6062,
    lng: -122.3321,
    region: 'West',
  },
  {
    code: 'WV',
    name: 'West Virginia',
    city: 'Charleston',
    zip: '25301',
    lat: 38.3498,
    lng: -81.6326,
    region: 'South',
  },
  {
    code: 'WI',
    name: 'Wisconsin',
    city: 'Milwaukee',
    zip: '53202',
    lat: 43.0389,
    lng: -87.9065,
    region: 'Midwest',
  },
  {
    code: 'WY',
    name: 'Wyoming',
    city: 'Cheyenne',
    zip: '82001',
    lat: 41.14,
    lng: -104.8202,
    region: 'Mountain',
  },
];

const locationByCode = Object.fromEntries(
  usLocations.map((location) => [location.code, location]),
) as Record<string, USLocation>;

const emptyCounts: Record<ItemKey, number> = {
  carryOn: 0,
  checked: 1,
  oversize: 0,
  box: 0,
  golf: 0,
  ski: 0,
  envelope: 0,
};

const initialQuote: QuoteState = {
  counts: emptyCounts,
  originState: 'TX',
  destinationState: 'CA',
  pickupDate: '2026-09-09',
  pickupWindow: '10:00 AM - 12:00 PM',
  speed: 'standard',
  protection: true,
  pickup: true,
  residential: true,
  declaredValue: 500,
  customerType: 'business',
  carrier: 'best',
};

const initialBooking: BookingState = {
  pickupAddress: '',
  pickupCity: '',
  pickupState: '',
  pickupZip: '',
  destinationAddress: '',
  destinationCity: '',
  destinationState: '',
  destinationZip: '',
  contactName: '',
  contactEmail: '',
  phone: '',
  notes: '',
};

const initialQuoteContact: QuoteContactState = {
  shipperName: '',
  shipperEmail: '',
  shipperPhone: '',
  pickupStreet: '',
  pickupUnit: '',
  pickupCity: '',
  pickupState: '',
  pickupZip: '',
  recipientName: '',
  recipientEmail: '',
  recipientPhone: '',
  deliveryStreet: '',
  deliveryUnit: '',
  deliveryCity: '',
  deliveryState: '',
  deliveryZip: '',
  deliveryInstructions: '',
};

const itemOrder: ItemKey[] = [
  'carryOn',
  'checked',
  'oversize',
  'box',
  'golf',
  'ski',
  'envelope',
];

const itemDefinitions: Record<ItemKey, ItemDefinition> = {
  carryOn: {
    label: 'Carry-on',
    sublabel: 'Compact luggage',
    max: '25 lb / 22 x 14 x 9 in',
    weight: 25,
    length: 22,
    width: 14,
    height: 9,
    icon: <InboxOutlined />,
  },
  checked: {
    label: 'Checked bag',
    sublabel: 'Standard suitcase',
    max: '50 lb / 27 x 18 x 12 in',
    weight: 50,
    length: 27,
    width: 18,
    height: 12,
    icon: <InboxOutlined />,
  },
  oversize: {
    label: 'Oversize bag',
    sublabel: 'Large luggage',
    max: '75 lb / 32 x 20 x 14 in',
    weight: 75,
    length: 32,
    width: 20,
    height: 14,
    icon: <ShoppingOutlined />,
    oversize: true,
  },
  box: {
    label: 'Box',
    sublabel: 'Cartons and cases',
    max: '50 lb / 24 x 18 x 18 in',
    weight: 50,
    length: 24,
    width: 18,
    height: 18,
    icon: <ShopOutlined />,
  },
  golf: {
    label: 'Golf clubs',
    sublabel: 'Travel bag and clubs',
    max: '50 lb / 48 x 14 x 12 in',
    weight: 50,
    length: 48,
    width: 14,
    height: 12,
    icon: <CompassOutlined />,
    oversize: true,
  },
  ski: {
    label: 'Ski / snowboard',
    sublabel: 'Skis, board, boots',
    max: '50 lb / 70 x 12 x 8 in',
    weight: 50,
    length: 70,
    width: 12,
    height: 8,
    icon: <CloudServerOutlined />,
    oversize: true,
  },
  envelope: {
    label: 'Envelope',
    sublabel: 'Documents and flat items',
    max: '2 lb / 12 x 9 x 1 in',
    weight: 2,
    length: 12,
    width: 9,
    height: 1,
    icon: <FileDoneOutlined />,
  },
};

const speedDefinitions: Record<
  SpeedKey,
  { label: string; detail: string; multiplier: number; transitByZone: string[] }
> = {
  standard: {
    label: 'Ground',
    detail: 'Best value domestic service',
    multiplier: 1,
    transitByZone: [
      '',
      '',
      '1-2 business days',
      '2 business days',
      '2-3 business days',
      '3 business days',
      '3-4 business days',
      '4-5 business days',
      '5-7 business days',
    ],
  },
  nextDay: {
    label: 'Next day',
    detail: 'Priority air estimate',
    multiplier: 2.28,
    transitByZone: [
      '',
      '',
      'next business day',
      'next business day',
      'next business day',
      'next business day',
      'next business day',
      '1-2 business days',
      '2 business days',
    ],
  },
  sameDay: {
    label: 'Same day',
    detail: 'Metro courier estimate',
    multiplier: 3.75,
    transitByZone: [
      '',
      '',
      'same day',
      'same day by courier',
      'same day by courier',
      'not generally available',
      'not generally available',
      'not generally available',
      'not generally available',
    ],
  },
};

const carrierTrackingPages: Record<CarrierProvider, string> = {
  ups: 'https://www.ups.com/track?loc=en_US',
  fedex: 'https://www.fedex.com/en-us/tracking.html',
};

const carrierProfiles: Record<
  CarrierProvider,
  {
    name: string;
    base: number;
    perLbByZone: Record<number, number>;
    fuelPct: number;
    pickupFee: number;
    residentialFee: number;
    additionalHandling: number;
    remotePct: number;
    serviceNames: Record<SpeedKey, string>;
    trackingUrl: (trackingNumber: string) => string;
  }
> = {
  ups: {
    name: 'UPS',
    base: 11.75,
    perLbByZone: {
      2: 0.24,
      3: 0.29,
      4: 0.36,
      5: 0.44,
      6: 0.52,
      7: 0.63,
      8: 0.76,
    },
    fuelPct: 0.164,
    pickupFee: 10.5,
    residentialFee: 5.95,
    additionalHandling: 18.75,
    remotePct: 0.48,
    serviceNames: {
      standard: 'UPS Ground estimate',
      nextDay: 'UPS Next Day Air estimate',
      sameDay: 'UPS Express Critical style estimate',
    },
    trackingUrl: (trackingNumber) =>
      trackingNumber
        ? `https://www.ups.com/track?loc=en_US&tracknum=${encodeURIComponent(trackingNumber)}`
        : carrierTrackingPages.ups,
  },
  fedex: {
    name: 'FedEx',
    base: 12.35,
    perLbByZone: {
      2: 0.23,
      3: 0.3,
      4: 0.35,
      5: 0.43,
      6: 0.51,
      7: 0.61,
      8: 0.73,
    },
    fuelPct: 0.158,
    pickupFee: 10,
    residentialFee: 5.7,
    additionalHandling: 19.25,
    remotePct: 0.45,
    serviceNames: {
      standard: 'FedEx Ground estimate',
      nextDay: 'FedEx Priority Overnight estimate',
      sameDay: 'FedEx SameDay style estimate',
    },
    trackingUrl: (trackingNumber) =>
      trackingNumber
        ? `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`
        : carrierTrackingPages.fedex,
  },
};

const coverageMetrics = [
  ['50 states + DC', 'USA-only coverage'],
  ['UPS + FedEx', 'tracking handoff'],
  ['Zone 2-8', 'domestic pricing logic'],
  ['DIM / 139', 'billable weight model'],
];

const coexServices = [
  {
    title: 'Domestic Parcel',
    text: 'Suitcases, boxes, golf clubs, skis, envelopes, and everyday shipments priced by state lane, zone, and billable weight.',
    icon: <InboxOutlined />,
  },
  {
    title: 'Road Transportation',
    text: 'USA-only road and final-mile movement with pickup windows, residential delivery, and proof-of-delivery readiness.',
    icon: <TruckOutlined />,
  },
  {
    title: 'Air Priority',
    text: 'Next-day and same-day style estimates for urgent lanes, with availability notes on long-distance or remote moves.',
    icon: <SendOutlined />,
  },
  {
    title: 'Warehousing & Distribution',
    text: 'A COEX operating model for storage, order flow, and inventory support near the customer.',
    icon: <BankOutlined />,
  },
  {
    title: 'Documents & Labels',
    text: 'Digital labels, carrier receipts, protection certificates, commercial paperwork, and handoff records kept together.',
    icon: <FileDoneOutlined />,
  },
  {
    title: 'End-to-End Visibility',
    text: 'Quote, booking, carrier handoff, milestone tracking, and exception status inside one Ant Design experience.',
    icon: <ClusterOutlined />,
  },
];

const coexSolutions = [
  {
    title: 'Travel & Students',
    text: 'Doorstep suitcase and box shipping between homes, campuses, hotels, and airports across the United States.',
    icon: <ShoppingOutlined />,
  },
  {
    title: 'Retail & E-commerce',
    text: 'Multi-state parcel flows with carrier comparison and ready-to-configure live rate APIs.',
    icon: <ShopOutlined />,
  },
  {
    title: 'Manufacturing',
    text: 'Inbound component and sample shipments sequenced to operating schedules.',
    icon: <CloudServerOutlined />,
  },
  {
    title: 'Healthcare & High Value',
    text: 'Priority handling cues, protection values, and tracking links for high-attention shipments.',
    icon: <SafetyCertificateOutlined />,
  },
];

const processSteps = [
  [
    '01',
    'Select US lane',
    'Choose origin and destination from every state plus Washington, DC.',
  ],
  [
    '02',
    'Price the shipment',
    'The calculator applies zone, mileage, DIM weight, carrier, surcharges, and protection.',
  ],
  [
    '03',
    'Book pickup',
    'Capture address, contact, pickup window, delivery notes, and cargo details.',
  ],
  [
    '04',
    'Track delivery',
    'Use COEX demo tracking or hand off real numbers to UPS and FedEx.',
  ],
];

const integrationCards = [
  {
    title: 'UPS Rating API',
    text: 'Credential-ready rate comparison path for account or list rates.',
    icon: <DollarCircleOutlined />,
  },
  {
    title: 'UPS Tracking API',
    text: 'OAuth-ready tracking path plus public UPS tracking link handoff.',
    icon: <SearchOutlined />,
  },
  {
    title: 'FedEx Rates API',
    text: 'Credential-ready Rates and Transit Times path for service availability.',
    icon: <ThunderboltOutlined />,
  },
  {
    title: 'FedEx Tracking',
    text: 'Public FedEx tracking handoff with number detection and carrier actions.',
    icon: <TruckOutlined />,
  },
  {
    title: 'Address Validation',
    text: 'Prepared for carrier-side address validation before label purchase.',
    icon: <EnvironmentOutlined />,
  },
  {
    title: 'Documents',
    text: 'Label, receipt, protection, and shipment milestone document slots.',
    icon: <FileDoneOutlined />,
  },
];

const sampleShipments: Shipment[] = [
  {
    number: '',
    carrier: 'auto',
    status: 'NO SHIPMENT FOUND',
    progress: 0,
    origin: '',
    destination: '',
    mode: '',
    eta: '',
    pieces: '',
    documents: [],
    trackingLinks: [],
    exception: '',
    milestones: [],
  }
];

const faqItems = [
  {
    key: 'pricing',
    label: 'How is the domestic estimate calculated?',
    children:
      'The calculator uses origin and destination state coordinates, domestic zones 2 through 8, actual weight, dimensional weight using a 139 divisor, selected service speed, residential delivery, pickup, additional handling, remote state logic, declared value protection, and carrier profile comparison.',
  },
  {
    key: 'live-rates',
    label: 'Are these exact UPS and FedEx account rates?',
    children:
      'The visible calculator is a transparent estimate. Exact live rates require the site owner to connect UPS and FedEx account credentials server-side so the official carrier APIs can return account-specific or list rates.',
  },
  {
    key: 'coverage',
    label: 'Where does the service operate?',
    children:
      'This redesign is USA-only. The location selector includes all 50 states and Washington, DC, with Alaska and Hawaii treated as non-contiguous remote lanes.',
  },
  {
    key: 'tracking',
    label: 'Can users track UPS and FedEx packages?',
    children:
      'Yes. The tracker detects UPS-style and FedEx-style numbers, creates direct carrier tracking links, and keeps demo COEX tracking for staged shipments.',
  },
  {
    key: 'contact',
    label: 'How can customers reach COEX?',
    children:
      'The Lovable reference lists +1 862-381-9018 and hello@coexshipping.com for customer contact.',
  },
];

function radians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMiles(origin: USLocation, destination: USLocation) {
  if (origin.code === destination.code) {
    return 75;
  }

  const earthRadiusMiles = 3958.8;
  const latDelta = radians(destination.lat - origin.lat);
  const lngDelta = radians(destination.lng - origin.lng);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(radians(origin.lat)) *
      Math.cos(radians(destination.lat)) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.max(75, Math.round(earthRadiusMiles * c * 1.14));
}

function getZone(distanceMiles: number) {
  if (distanceMiles <= 150) return 2;
  if (distanceMiles <= 300) return 3;
  if (distanceMiles <= 600) return 4;
  if (distanceMiles <= 1000) return 5;
  if (distanceMiles <= 1400) return 6;
  if (distanceMiles <= 1800) return 7;
  return 8;
}

function getDimWeight(definition: ItemDefinition) {
  return Math.ceil(
    (definition.length * definition.width * definition.height) / 139,
  );
}

function getQuoteWeights(counts: Record<ItemKey, number>) {
  return itemOrder.reduce(
    (totals, key) => {
      const definition = itemDefinitions[key];
      const count = counts[key];
      const dimWeight = getDimWeight(definition);
      const billable = Math.max(definition.weight, dimWeight);

      return {
        packages: totals.packages + count,
        actualWeight: totals.actualWeight + definition.weight * count,
        dimWeight: totals.dimWeight + dimWeight * count,
        billableWeight: totals.billableWeight + billable * count,
      };
    },
    { packages: 0, actualWeight: 0, dimWeight: 0, billableWeight: 0 },
  );
}

function getCarrierRate(
  provider: CarrierProvider,
  quote: QuoteState,
  lane: {
    origin: USLocation;
    destination: USLocation;
    distanceMiles: number;
    zone: number;
  },
): CarrierRate {
  const profile = carrierProfiles[provider];
  const weights = getQuoteWeights(quote.counts);
  const perPound = profile.perLbByZone[lane.zone];
  const speed = speedDefinitions[quote.speed];
  const hasOversize = itemOrder.some(
    (key) => quote.counts[key] > 0 && itemDefinitions[key].oversize,
  );
  const packageCharge = weights.packages
    ? profile.base * weights.packages + weights.billableWeight * perPound
    : 0;
  const serviceCharge = packageCharge * speed.multiplier;
  const additionalHandling =
    hasOversize || weights.billableWeight >= 70
      ? profile.additionalHandling * Math.max(1, weights.packages)
      : 0;
  const pickupFee = quote.pickup
    ? profile.pickupFee + weights.packages * 1.75
    : 0;
  const residentialFee = quote.residential ? profile.residentialFee : 0;
  const remoteFee =
    lane.origin.remote || lane.destination.remote
      ? (serviceCharge + additionalHandling) * profile.remotePct
      : 0;
  const accessorials =
    pickupFee + residentialFee + additionalHandling + remoteFee;
  const fuel = (serviceCharge + accessorials) * profile.fuelPct;
  const protection = quote.protection
    ? Math.max(8, Math.round(quote.declaredValue * 0.0125))
    : 0;
  const subtotal = serviceCharge + accessorials + fuel + protection;
  const discount = quote.customerType === 'business' ? subtotal * 0.08 : 0;
  let total = weights.packages
    ? Math.round(Math.max(22, subtotal - discount))
    : 0;
  let couponDiscount = 0;
  if (quote.couponCode === 'NEW30') {
    couponDiscount = Math.round(total * 0.3);
    total -= couponDiscount;
  }
  const deliveryDate = getDeliveryDate(
    quote.pickupDate,
    quote.speed,
    lane.zone,
  );

  return {
    key: provider,
    name: profile.name,
    service: profile.serviceNames[quote.speed],
    total,
    base: Math.round(profile.base * weights.packages),
    transportation: Math.round(serviceCharge),
    fuel: Math.round(fuel),
    accessorials: Math.round(accessorials),
    protection,
    discount: Math.round(discount),
    couponDiscount,
    transit: speed.transitByZone[lane.zone] ?? 'carrier confirmation required',
    deliveryDate,
    trackingUrl: profile.trackingUrl(''),
  };
}

function getDeliveryDate(pickupDate: string, speed: SpeedKey, zone: number) {
  const date = new Date(`${pickupDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return 'Carrier ETA';
  }

  const businessDays =
    speed === 'sameDay'
      ? 0
      : speed === 'nextDay'
        ? zone >= 8
          ? 2
          : 1
        : Math.max(1, Math.ceil(zone / 2));
  let remaining = businessDays;

  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getQuoteMetrics(quote: QuoteState): QuoteMetrics {
  const origin = locationByCode[quote.originState] ?? locationByCode.TX;
  const destination =
    locationByCode[quote.destinationState] ?? locationByCode.CA;
  const weights = getQuoteWeights(quote.counts);
  const distanceMiles = getDistanceMiles(origin, destination);
  const zone = getZone(distanceMiles);
  const lane = { origin, destination, distanceMiles, zone };
  const rates = {
    ups: getCarrierRate('ups', quote, lane),
    fedex: getCarrierRate('fedex', quote, lane),
  };
  const selectedCarrier =
    quote.carrier === 'ups' || quote.carrier === 'fedex'
      ? quote.carrier
      : rates.ups.total <= rates.fedex.total
        ? 'ups'
        : 'fedex';
  const selectedRate = rates[selectedCarrier];
  const marketBenchmark = Math.round(
    weights.packages
      ? weights.packages * 58 + weights.billableWeight * (0.92 + zone * 0.08)
      : 0,
  );
  const availabilityNote =
    quote.speed === 'sameDay' &&
    (zone >= 5 || origin.remote || destination.remote)
      ? 'Same-day availability is limited on this lane; carrier confirmation is required before purchase.'
      : origin.remote || destination.remote
        ? 'Alaska and Hawaii use non-contiguous remote-lane pricing and longer carrier confirmation windows.'
        : 'Domestic USA lane is available for estimate.';

  return {
    ...weights,
    distanceMiles,
    zone,
    origin,
    destination,
    routeLabel: `${formatLocation(origin.code)} to ${formatLocation(destination.code)}`,
    selectedCarrier,
    total: selectedRate.total,
    savings: Math.max(0, marketBenchmark - selectedRate.total),
    eta: selectedRate.deliveryDate,
    service: selectedRate.service,
    protectionFee: selectedRate.protection,
    pickupFee: quote.pickup
      ? carrierProfiles[selectedCarrier].pickupFee + weights.packages * 1.75
      : 0,
    residentialFee: quote.residential
      ? carrierProfiles[selectedCarrier].residentialFee
      : 0,
    remoteFee:
      origin.remote || destination.remote
        ? selectedRate.accessorials -
          (quote.pickup
            ? carrierProfiles[selectedCarrier].pickupFee +
              weights.packages * 1.75
            : 0) -
          (quote.residential
            ? carrierProfiles[selectedCarrier].residentialFee
            : 0)
        : 0,
    rates,
    availabilityNote,
  };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLocation(code: string) {
  const location = locationByCode[code] ?? usLocations[0];
  return `${location.city}, ${location.code}`;
}

function locationSelectOptions() {
  return usLocations.map((location) => ({
    value: location.code,
    label: `${location.code} - ${location.city}, ${location.name} ${location.zip}`,
  }));
}

function getCarrierName(carrier: TrackingCarrier) {
  if (carrier === 'ups') return 'UPS';
  if (carrier === 'fedex') return 'FedEx';
  return 'carrier';
}

function getCityImage(location: USLocation, index: number) {
  const seed = encodeURIComponent(location.city.toLowerCase().replace(/\s+/g, '-'));
  return `https://picsum.photos/seed/${seed}/180/255`;
}

function getRequiredQuoteContactFields(contact: QuoteContactState) {
  return [
    contact.shipperName,
    contact.shipperEmail,
    contact.shipperPhone,
    contact.pickupStreet,
    contact.pickupCity,
    contact.pickupState,
    contact.pickupZip,
    contact.recipientName,
    contact.recipientEmail,
    contact.recipientPhone,
    contact.deliveryStreet,
    contact.deliveryCity,
    contact.deliveryState,
    contact.deliveryZip,
  ];
}

function isQuoteContactComplete(contact: QuoteContactState) {
  return getRequiredQuoteContactFields(contact).every(
    (value) => value.trim().length > 0,
  );
}

function formatAddressLine({
  street,
  unit,
  city,
  state,
  zip,
}: {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
}) {
  const unitText = unit.trim() ? `, ${unit.trim()}` : '';
  return `${street.trim()}${unitText}, ${city.trim()}, ${state} ${zip.trim()}`;
}

function detectCarrier(trackingNumber: string): TrackingCarrier {
  const trimmed = trackingNumber.trim().toUpperCase();
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (/^1Z[0-9A-Z]{16}$/.test(trimmed)) {
    return 'ups';
  }

  if ([12, 15, 20, 22].includes(digitsOnly.length)) {
    return 'fedex';
  }

  return 'auto';
}

function getTrackingNumberFromUrl(url: URL) {
  const parameterNames = [
    'tracknum',
    'tracknums',
    'trackNums',
    'trackingNumber',
    'trackingnumber',
    'trknbr',
    'trknum',
    'tracknumbers',
  ];

  for (const parameter of parameterNames) {
    const value = url.searchParams.get(parameter);
    if (value?.trim()) {
      return value.split(',')[0].trim();
    }
  }

  return (
    url.href.match(/1Z[0-9A-Z]{16}/i)?.[0] ??
    url.href.match(/\b\d{12,22}\b/)?.[0] ??
    ''
  );
}

function normalizeTrackingInput(
  input: string,
  preferredCarrier: TrackingCarrier,
): NormalizedTrackingInput {
  const raw = input.trim();
  let trackingNumber = raw.toUpperCase();
  let carrierFromUrl: TrackingCarrier = 'auto';
  let isCarrierPage = false;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();

    if (host.includes('ups.com')) {
      carrierFromUrl = 'ups';
    }

    if (host.includes('fedex.com')) {
      carrierFromUrl = 'fedex';
    }

    if (carrierFromUrl !== 'auto') {
      trackingNumber = getTrackingNumberFromUrl(url).toUpperCase();
      isCarrierPage = !trackingNumber;
    }
  } catch {
    // Plain tracking numbers are handled by the pattern detector below.
  }

  const detectedCarrier = detectCarrier(trackingNumber);
  const carrier =
    preferredCarrier !== 'auto'
      ? preferredCarrier
      : carrierFromUrl !== 'auto'
        ? carrierFromUrl
        : detectedCarrier;

  return {
    raw,
    trackingNumber,
    carrier,
    isCarrierPage,
  };
}

function getTrackingLinks(
  trackingNumber: string,
  carrier: TrackingCarrier,
): Shipment['trackingLinks'] {
  const clean = trackingNumber.trim();
  if (!clean && (carrier === 'ups' || carrier === 'fedex')) {
    return [
      {
        carrier,
        label: `Open ${getCarrierName(carrier)} tracking page`,
        url: carrierTrackingPages[carrier],
      },
    ];
  }

  if (!clean) return [];

  if (carrier === 'ups') {
    return [
      {
        carrier: 'ups',
        label: 'Open UPS tracking',
        url: carrierProfiles.ups.trackingUrl(clean),
      },
    ];
  }

  if (carrier === 'fedex') {
    return [
      {
        carrier: 'fedex',
        label: 'Open FedEx tracking',
        url: carrierProfiles.fedex.trackingUrl(clean),
      },
    ];
  }

  return [
    {
      carrier: 'ups',
      label: 'Try UPS tracking',
      url: carrierProfiles.ups.trackingUrl(clean),
    },
    {
      carrier: 'fedex',
      label: 'Try FedEx tracking',
      url: carrierProfiles.fedex.trackingUrl(clean),
    },
  ];
}

function createFallbackShipment(
  number: string,
  selectedCarrier: TrackingCarrier = 'auto',
): Shipment {
  const carrier =
    selectedCarrier === 'auto' ? detectCarrier(number) : selectedCarrier;
  const links = getTrackingLinks(number, carrier);

  return {
    number: number || 'NO-TRACKING',
    carrier,
    status: 'SHIPMENT NOT FOUND',
    progress: 0,
    origin: 'Unknown',
    destination: 'Unknown',
    mode: 'Unrecognized Tracking Number',
    eta: 'N/A',
    pieces: '0',
    documents: [],
    exception: 'No shipment record found in database.',
    trackingLinks: links,
    milestones: [
      {
        title: 'Shipment not found',
        detail: 'The tracking number provided does not match any record.',
        done: false,
      }
    ],
  };
}

function useQuoteState() {
  return useState<QuoteState>(() => ({
    ...initialQuote,
    counts: { ...initialQuote.counts },
  }));
}

function updateCount(
  setQuote: Dispatch<SetStateAction<QuoteState>>,
  key: ItemKey,
  delta: number,
) {
  setQuote((current) => ({
    ...current,
    counts: {
      ...current.counts,
      [key]: Math.max(0, Math.min(12, current.counts[key] + delta)),
    },
  }));
}

function useWebMcpTools({
  quote,
  setQuote,
  setShipment,
}: {
  quote: QuoteState;
  setQuote: Dispatch<SetStateAction<QuoteState>>;
  setShipment: Dispatch<SetStateAction<Shipment>>;
}) {
  useEffect(() => {
    const registerTool = document.modelContext?.registerTool;
    if (!registerTool) return;

    const lifecycle = new AbortController();
    const register = (tool: WebMcpTool) => {
      Promise.resolve(registerTool(tool, { signal: lifecycle.signal })).catch(
        () => undefined,
      );
    };

    register({
      name: 'calculate_quote',
      title: 'Calculate domestic quote',
      description:
        'Calculate a USA-only COEX Shipping estimate using state lane, package counts, speed, carrier, and surcharge settings.',
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      inputSchema: {
        type: 'object',
        properties: {
          originState: {
            type: 'string',
            enum: usLocations.map((location) => location.code),
          },
          destinationState: {
            type: 'string',
            enum: usLocations.map((location) => location.code),
          },
          speed: { type: 'string', enum: ['standard', 'nextDay', 'sameDay'] },
          carrier: { type: 'string', enum: ['best', 'ups', 'fedex'] },
          protection: { type: 'boolean' },
          pickup: { type: 'boolean' },
          residential: { type: 'boolean' },
          declaredValue: { type: 'number', minimum: 0, maximum: 25000 },
          customerType: { type: 'string', enum: ['individual', 'business'] },
          items: {
            type: 'object',
            properties: Object.fromEntries(
              itemOrder.map((key) => [
                key,
                { type: 'number', minimum: 0, maximum: 12 },
              ]),
            ),
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      execute(input) {
        const value =
          typeof input === 'object' && input !== null
            ? (input as Record<string, unknown>)
            : {};
        const suppliedItems =
          typeof value.items === 'object' && value.items !== null
            ? (value.items as Record<string, unknown>)
            : {};
        const counts = { ...quote.counts };

        for (const key of itemOrder) {
          const next = suppliedItems[key];
          if (typeof next === 'number' && Number.isFinite(next)) {
            counts[key] = Math.max(0, Math.min(12, Math.round(next)));
          }
        }

        const originState =
          typeof value.originState === 'string' &&
          locationByCode[value.originState]
            ? value.originState
            : quote.originState;
        const destinationState =
          typeof value.destinationState === 'string' &&
          locationByCode[value.destinationState]
            ? value.destinationState
            : quote.destinationState;
        const speed =
          value.speed === 'nextDay' || value.speed === 'sameDay'
            ? value.speed
            : value.speed === 'standard'
              ? 'standard'
              : quote.speed;
        const carrier =
          value.carrier === 'ups' || value.carrier === 'fedex'
            ? value.carrier
            : value.carrier === 'best'
              ? 'best'
              : quote.carrier;

        const nextQuote: QuoteState = {
          ...quote,
          counts,
          originState,
          destinationState,
          speed,
          carrier,
          protection:
            typeof value.protection === 'boolean'
              ? value.protection
              : quote.protection,
          pickup:
            typeof value.pickup === 'boolean' ? value.pickup : quote.pickup,
          residential:
            typeof value.residential === 'boolean'
              ? value.residential
              : quote.residential,
          declaredValue:
            typeof value.declaredValue === 'number' &&
            Number.isFinite(value.declaredValue)
              ? Math.max(0, Math.min(25000, Math.round(value.declaredValue)))
              : quote.declaredValue,
          customerType:
            value.customerType === 'business'
              ? 'business'
              : value.customerType === 'individual'
                ? 'individual'
                : quote.customerType,
        };
        const metrics = getQuoteMetrics(nextQuote);
        setQuote(nextQuote);

        return {
          status: 'quote_ready',
          quote: {
            total: metrics.total,
            formattedTotal: formatMoney(metrics.total),
            selectedCarrier: metrics.selectedCarrier,
            route: metrics.routeLabel,
            zone: metrics.zone,
            distanceMiles: metrics.distanceMiles,
            packages: metrics.packages,
            actualWeight: metrics.actualWeight,
            dimWeight: metrics.dimWeight,
            billableWeight: metrics.billableWeight,
            eta: metrics.eta,
            service: metrics.service,
            savings: metrics.savings,
            ups: metrics.rates.ups.total,
            fedex: metrics.rates.fedex.total,
            note: metrics.availabilityNote,
          },
        };
      },
    });

    register({
      name: 'track_shipment',
      title: 'Track shipment',
      description:
        'Track a COEX demo shipment or prepare UPS/FedEx tracking links for a real carrier number.',
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      inputSchema: {
        type: 'object',
        properties: {
          trackingNumber: { type: 'string' },
          carrier: { type: 'string', enum: ['auto', 'ups', 'fedex'] },
        },
        required: ['trackingNumber'],
        additionalProperties: false,
      },
      execute(input) {
        const value =
          typeof input === 'object' && input !== null
            ? (input as Record<string, unknown>)
            : {};
        if (
          typeof value.trackingNumber !== 'string' ||
          !value.trackingNumber.trim()
        ) {
          throw new Error('trackingNumber is required');
        }

        const preferredCarrier =
          value.carrier === 'ups' || value.carrier === 'fedex'
            ? value.carrier
            : 'auto';
        const normalized = normalizeTrackingInput(
          value.trackingNumber,
          preferredCarrier,
        );
        const requested = normalized.trackingNumber;
        const shipment =
          sampleShipments.find((item) => item.number === requested) ??
          createFallbackShipment(requested, normalized.carrier);
        setShipment(shipment);

        return {
          status: 'tracking_ready',
          shipment: {
            number: shipment.number,
            carrier: shipment.carrier,
            status: shipment.status,
            progress: shipment.progress,
            origin: shipment.origin,
            destination: shipment.destination,
            eta: shipment.eta,
            trackingLinks: shipment.trackingLinks,
          },
        };
      },
    });

    return () => lifecycle.abort();
  }, [quote, setQuote, setShipment]);
}

function TruckAnimationRail() {
  return (
    <div className="truck-animation-rail" aria-hidden="true">
      <div className="truck-animation-track">
        <span className="rail-hub hub-left" />
        <span className="rail-hub hub-mid" />
        <span className="rail-hub hub-right" />
        <span className="rail-truck">
          <TruckOutlined />
        </span>
      </div>
    </div>
  );
}

function DesktopSideDesign() {
  return (
    <>
      <div className="desktop-side-design left" aria-hidden="true">
        <span className="side-label">COEX</span>
        <span className="side-node primary" />
        <span className="side-path" />
        <span className="side-chip">50 states</span>
        <span className="side-chip accent">Zone 2-8</span>
        <span className="side-node small" />
      </div>
      <div className="desktop-side-design right" aria-hidden="true">
        <span className="side-label">Live lane</span>
        <span className="side-node primary" />
        <span className="side-path" />
        <span className="side-chip">UPS</span>
        <span className="side-chip accent">FedEx</span>
        <span className="side-node small" />
      </div>
    </>
  );
}

function HeroStatStrip({
  items,
}: {
  items: Array<{ icon: ReactNode; label: string; value: string }>;
}) {
  return (
    <div className="hero-stat-strip">
      {items.map((item) => (
        <div className="hero-stat-item" key={item.label}>
          <span>{item.icon}</span>
          <small>{item.label}</small>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

const heroCardWidth = 60;
const heroCardHeight = 85;
const heroMaxScroll = 3000;

function StateDeliveryHero({ metrics }: { metrics: QuoteMetrics }) {
  const [introPhase, setIntroPhase] = useState<'scatter' | 'line' | 'circle'>(
    'scatter',
  );
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const smoothScrollRef = useRef(0);
  const smoothMouseXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const introPhaseRef = useRef(introPhase);
  const introTextRef = useRef<HTMLDivElement>(null);
  const contentTextRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => { introPhaseRef.current = introPhase; }, [introPhase]);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const scrollRef = useRef(0);
  const scrollTargetRef = useRef(0);
  const mouseTargetRef = useRef(0);

  const scatterPositions = useMemo(
    () =>
      usLocations.map((_, index) => ({
        x: Math.sin(index * 23.71) * 780 + Math.cos(index * 5.13) * 120,
        y: Math.cos(index * 17.33) * 450 + Math.sin(index * 3.91) * 90,
        rotation: Math.sin(index * 11.42) * 90,
        scale: 0.6,
        opacity: 0,
      })),
    [],
  );

  useEffect(() => {
    const timer1 = window.setTimeout(() => setIntroPhase('line'), 500);
    const timer2 = window.setTimeout(() => setIntroPhase('circle'), 2500);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateSize = () => {
      setContainerSize({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    };
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    updateSize();
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseTargetRef.current = normalizedX * 100;
    };
    const handleMouseLeave = () => {
      mouseTargetRef.current = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const track = scrollTrackRef.current;
    if (!track) return undefined;

    const handleScroll = () => {
      const rect = track.getBoundingClientRect();
      let scrolled = -rect.top;
      if (scrolled < 0) scrolled = 0;
      if (scrolled > heroMaxScroll) scrolled = heroMaxScroll;
      
      scrollTargetRef.current = scrolled;
      scrollRef.current = scrolled;
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  const updateAnimation = useCallback(() => {
    const width = containerSize.width || 980;
    const height = containerSize.height || 720;
    const total = usLocations.length;
    const isMobile = width < 768;
    const morphValue = Math.min(Math.max(smoothScrollRef.current / 600, 0), 1);
    const rotateProgress = Math.min(
      Math.max((smoothScrollRef.current - 600) / (heroMaxScroll - 600), 0),
      1,
    );
    const currentPhase = introPhaseRef.current;
    const introOpacity = currentPhase === 'circle' && morphValue < 0.5 ? 1 - morphValue * 2 : 0;
    const contentOpacity = Math.min(Math.max((morphValue - 0.8) / 0.2, 0), 1);

    // Precalculate card constants to save 3000 calculations per second
    const minDimension = Math.min(width, height);
    const circleRadius = Math.min(minDimension * 0.42, 450);
    const baseRadius = Math.min(width, height * 1.5);
    const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
    const arcApexY = height * (isMobile ? 0.35 : 0.25);
    const arcCenterY = arcApexY + arcRadius;
    const spreadAngle = isMobile ? 100 : 130;
    const startAngle = -90 - spreadAngle / 2;
    const step = spreadAngle / (total - 1);
    const boundedRotation = -rotateProgress * spreadAngle * 0.8;

    if (introTextRef.current) {
      introTextRef.current.style.opacity = String(introOpacity);
      introTextRef.current.style.transform = `translate(-50%, -50%) translate3d(0, ${introOpacity ? 0 : 20}px, 0)`;
      introTextRef.current.style.filter = `blur(${introOpacity ? 0 : 10}px)`;
    }
    
    if (contentTextRef.current) {
      contentTextRef.current.style.opacity = String(contentOpacity);
      contentTextRef.current.style.transform = `translate(-50%, ${(1 - contentOpacity) * 20}px)`;
    }

    usLocations.forEach((location, index) => {
      const el = cardRefs.current[index];
      if (!el) return;

      let x = 0;
      let y = 0;
      let rotation = 0;
      let scale = 1;
      let opacity = 1;

      if (currentPhase === 'scatter') {
        const scatter = scatterPositions[index];
        x = scatter.x;
        y = scatter.y;
        rotation = scatter.rotation;
        scale = scatter.scale;
        opacity = scatter.opacity;
      } else if (currentPhase === 'line') {
        const lineSpacing = 70;
        const lineTotalWidth = total * lineSpacing;
        x = index * lineSpacing - lineTotalWidth / 2;
      } else {
        const circleAngle = (index / total) * 360;
        const circleRad = (circleAngle * Math.PI) / 180;
        const circleX = Math.cos(circleRad) * circleRadius;
        const circleY = Math.sin(circleRad) * circleRadius;
        const circleRotation = circleAngle + 90;

        const currentArcAngle = startAngle + index * step + boundedRotation;
        const arcRad = (currentArcAngle * Math.PI) / 180;
        const arcScale = isMobile ? 1.4 : 1.8;
        const arcX = Math.cos(arcRad) * arcRadius + smoothMouseXRef.current;
        const arcY = Math.sin(arcRad) * arcRadius + arcCenterY;
        const arcRotation = currentArcAngle + 90;

        x = circleX * (1 - morphValue) + arcX * morphValue;
        y = circleY * (1 - morphValue) + arcY * morphValue;
        rotation = circleRotation * (1 - morphValue) + arcRotation * morphValue;
        scale = 1 * (1 - morphValue) + arcScale * morphValue;
      }

      // Disable CSS transition during JS-driven scrolling to fix severe lag
      el.style.transition = smoothScrollRef.current > 5 ? 'none' : '';
      el.style.willChange = smoothScrollRef.current > 5 ? 'transform, opacity' : 'auto';
      el.style.opacity = String(opacity);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
    });
  }, [containerSize, scatterPositions]);

  useEffect(() => {
    updateAnimation();
  }, [introPhase, containerSize, updateAnimation]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const track = scrollTrackRef.current;
          if (track) {
            let scrolled = -(track.getBoundingClientRect().top - 72);
            if (scrolled < 0) scrolled = 0;
            if (scrolled > heroMaxScroll) scrolled = heroMaxScroll;
            smoothScrollRef.current = scrolled;
            updateAnimation();
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [updateAnimation]);

  useEffect(() => {
    let frame = 0;
    const animateMouse = () => {
      const diff = mouseTargetRef.current - smoothMouseXRef.current;
      if (Math.abs(diff) >= 0.5) {
        smoothMouseXRef.current += diff * 0.08;
        updateAnimation();
      }
      frame = window.requestAnimationFrame(animateMouse);
    };
    frame = window.requestAnimationFrame(animateMouse);
    return () => window.cancelAnimationFrame(frame);
  }, [updateAnimation]);

  return (
    <div ref={scrollTrackRef} style={{ height: `calc(100vh - 72px + ${heroMaxScroll}px)` }}>
      <div ref={containerRef} className="state-delivery-hero" style={{ position: 'sticky', top: 72, height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
      <div
        ref={introTextRef}
        className="state-hero-intro"
        style={{ opacity: 0 } as CSSProperties}
      >
        <Title>Delivered to all 50 states.</Title>
        <Text>Scroll to explore</Text>
      </div>

      <div
        ref={contentTextRef}
        className="state-hero-content"
        style={{ opacity: 0 } as CSSProperties}
      >
        <Tag color="cyan" icon={<TruckOutlined />}>
          COEX USA Connect Express
        </Tag>
        <Title level={2}>Ship city to city across America.</Title>
        <Paragraph>
          {metrics.routeLabel} is priced as Zone {metrics.zone} with UPS and
          FedEx handoff ready.
        </Paragraph>
        <Space wrap className="state-hero-actions">
          <Button
            type="primary"
            icon={<DollarCircleOutlined />}
            onClick={() => router.push('/quote')}
          >
            Get quote
          </Button>
          <Button
            icon={<SearchOutlined />}
            onClick={() => router.push('/tracking')}
          >
            Track package
          </Button>
        </Space>
      </div>

      <div className="state-card-stage" aria-label="COEX 50-state destination city cards">
        {usLocations.map((location, index) => {
          return (
            <div
              ref={(el) => { cardRefs.current[index] = el; }}
              className="state-photo-card"
              key={location.code}
              style={{ '--card-z': String(index) } as CSSProperties}
            >
              <div className="state-photo-card-inner">
                <div className="state-photo-front">
                  <img
                    src={getCityImage(location, index)}
                    alt={`${location.city}, ${location.name}`}
                    loading={index < 12 ? 'eager' : 'lazy'}
                  />
                  <span>{location.code}</span>
                  <strong>{location.city}</strong>
                </div>
                <div className="state-photo-back">
                  <small>{location.region}</small>
                  <strong>{location.name}</strong>
                  <span>{location.zip}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function ShippingFrame({
  active,
  children,
}: {
  active: PageKey;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0f8f93',
          colorSuccess: '#16854e',
          colorWarning: '#c78300',
          colorInfo: '#2457c5',
          colorTextBase: '#152935',
          colorBgBase: '#f5fbfa',
          colorBorder: '#d7e5e3',
          borderRadius: 8,
          fontFamily:
            'var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif',
        },
        components: {
          Button: { controlHeight: 42, borderRadius: 8, fontWeight: 650 },
          Card: { borderRadiusLG: 8, paddingLG: 22 },
          Menu: { itemBorderRadius: 8 },
          Select: { borderRadius: 8 },
          Steps: { colorPrimary: '#0f8f93' },
        },
      }}
    >
      <Layout className="ship-app-shell">
        <Header className="ship-header">
          <Link className="ship-logo" href="/" aria-label="COEX Shipping home">
            <Image
              src="/coex-logo.svg"
              alt=""
              width={46}
              height={46}
              className="ship-logo-image"
            />
            <span>
              <strong>COEX Shipping</strong>
              <small>USA Connect Express</small>
            </span>
          </Link>
          <Menu
            className="ship-menu"
            mode="horizontal"
            selectedKeys={[active]}
            onClick={(e) => {
              if (e.key === 'home') router.push('/');
              else router.push(`/${e.key}`);
            }}
            items={[
              { key: 'home', label: 'Overview' },
              { key: 'quote', label: 'Quote' },
              {
                key: 'tracking',
                label: 'Tracking',
              },
              { key: 'book', label: 'Book' },
            ]}
          />
          <Space className="ship-header-actions" size={10}>
            <Button
              className="ship-signin"
              href="/login"
              icon={<UserOutlined />}
            >
              Sign in
            </Button>
            <Button
              type="primary"
              href="/quote"
              icon={<DollarCircleOutlined />}
            >
              Get quote
            </Button>
          </Space>
        </Header>
        <TruckAnimationRail />
        <DesktopSideDesign />
        <Content>{children}</Content>
        <Footer className="ship-footer">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10}>
              <Space align="start" size={12}>
                <Image
                  src="/coex-logo.svg"
                  alt=""
                  width={54}
                  height={54}
                  className="ship-footer-logo"
                />
                <div>
                  <Title level={4}>COEX Shipping</Title>
                  <Paragraph>
                    USA-only shipping experience for luggage, parcels, freight
                    workflows, quotes, carrier handoff, documents, and tracking.
                  </Paragraph>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={7}>
              <Text strong>Contact</Text>
              <ul className="ship-footer-list">
                <li>
                  <PhoneOutlined /> +1 862-381-9018
                </li>
                <li>
                  <MailOutlined /> hello@coexshipping.com
                </li>
              </ul>
            </Col>
            <Col xs={24} md={7}>
              <Text strong>Carrier readiness</Text>
              <ul className="ship-footer-list">
                <li>UPS Rating, Shipping, Tracking, Address Validation</li>
                <li>FedEx Rates, Transit Times, Tracking, Webhooks</li>
              </ul>
            </Col>
          </Row>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

function LocationSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Form.Item label={label}>
      <Select
        showSearch={{ optionFilterProp: 'label' }}
        value={value}
        options={locationSelectOptions()}
        onChange={onChange}
      />
    </Form.Item>
  );
}

function QuoteContactForm({
  contact,
  setContact,
  setQuote,
}: {
  contact: QuoteContactState;
  setContact: Dispatch<SetStateAction<QuoteContactState>>;
  setQuote: Dispatch<SetStateAction<QuoteState>>;
}) {
  function setContactField(key: keyof QuoteContactState, value: string) {
    setContact((current) => ({ ...current, [key]: value }));
  }

  function setAddressState(kind: 'pickup' | 'delivery', state: string) {
    const location = locationByCode[state];
    setContact((current) => ({
      ...current,
      ...(kind === 'pickup'
        ? {
            pickupState: state,
            pickupCity: location.city,
            pickupZip: location.zip,
          }
        : {
            deliveryState: state,
            deliveryCity: location.city,
            deliveryZip: location.zip,
          }),
    }));
    setQuote((current) => ({
      ...current,
      ...(kind === 'pickup'
        ? { originState: state }
        : { destinationState: state }),
    }));
  }

  return (
    <Card
      title="1. Customer, pickup, and delivery details"
      className="ant-card-premium quote-details-card"
    >
      <Space orientation="vertical" size={18} className="full-width">
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item label="Shipper full name" required>
              <Input
                value={contact.shipperName}
                onChange={(event) =>
                  setContactField('shipperName', event.target.value)
                }
                placeholder="Full name"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Shipper email" required>
              <Input
                type="email"
                value={contact.shipperEmail}
                onChange={(event) =>
                  setContactField('shipperEmail', event.target.value)
                }
                placeholder="name@example.com"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Shipper phone" required>
              <Input
                value={contact.shipperPhone}
                onChange={(event) =>
                  setContactField('shipperPhone', event.target.value)
                }
                placeholder="(555) 555-0123"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="quote-address-grid">
          <div className="quote-address-panel">
            <div className="quote-address-head">
              <EnvironmentOutlined />
              <Text strong>Pickup address</Text>
            </div>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={16}>
                <Form.Item label="Street address" required>
                  <AddressAutocomplete
                    value={contact.pickupStreet}
                    onChange={(val) => setContactField('pickupStreet', val)}
                    onSelectAddress={(data) => {
                      setContactField('pickupStreet', data.address);
                      setContactField('pickupCity', data.city);
                      setAddressState('pickup', data.state);
                      setContactField('pickupZip', data.zip);
                    }}
                    placeholder="Street address"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Apt / suite / ext.">
                  <Input
                    value={contact.pickupUnit}
                    onChange={(event) =>
                      setContactField('pickupUnit', event.target.value)
                    }
                    placeholder="Suite, dock, gate"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="City" required>
                  <Input
                    value={contact.pickupCity}
                    onChange={(event) =>
                      setContactField('pickupCity', event.target.value)
                    }
                    placeholder="City"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="State" required>
                  <Select
                    showSearch={{ optionFilterProp: 'label' }}
                    value={contact.pickupState}
                    options={locationSelectOptions()}
                    onChange={(state) => setAddressState('pickup', state)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="ZIP code" required>
                  <Input
                    value={contact.pickupZip}
                    onChange={(event) =>
                      setContactField('pickupZip', event.target.value)
                    }
                    placeholder="ZIP"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="quote-address-panel">
            <div className="quote-address-head">
              <TruckOutlined />
              <Text strong>Delivery contact and address</Text>
            </div>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <Form.Item label="Recipient full name" required>
                  <Input
                    value={contact.recipientName}
                    onChange={(event) =>
                      setContactField('recipientName', event.target.value)
                    }
                    placeholder="Recipient name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Recipient email" required>
                  <Input
                    type="email"
                    value={contact.recipientEmail}
                    onChange={(event) =>
                      setContactField('recipientEmail', event.target.value)
                    }
                    placeholder="recipient@example.com"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Recipient phone" required>
                  <Input
                    value={contact.recipientPhone}
                    onChange={(event) =>
                      setContactField('recipientPhone', event.target.value)
                    }
                    placeholder="(555) 555-0123"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item label="Street address" required>
                  <AddressAutocomplete
                    value={contact.deliveryStreet}
                    onChange={(val) => setContactField('deliveryStreet', val)}
                    onSelectAddress={(data) => {
                      setContactField('deliveryStreet', data.address);
                      setContactField('deliveryCity', data.city);
                      setAddressState('delivery', data.state);
                      setContactField('deliveryZip', data.zip);
                    }}
                    placeholder="Street address"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Apt / suite / ext.">
                  <Input
                    value={contact.deliveryUnit}
                    onChange={(event) =>
                      setContactField('deliveryUnit', event.target.value)
                    }
                    placeholder="Apt, suite, hotel, desk"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="City" required>
                  <Input
                    value={contact.deliveryCity}
                    onChange={(event) =>
                      setContactField('deliveryCity', event.target.value)
                    }
                    placeholder="City"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="State" required>
                  <Select
                    showSearch={{ optionFilterProp: 'label' }}
                    value={contact.deliveryState}
                    options={locationSelectOptions()}
                    onChange={(state) => setAddressState('delivery', state)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="ZIP code" required>
                  <Input
                    value={contact.deliveryZip}
                    onChange={(event) =>
                      setContactField('deliveryZip', event.target.value)
                    }
                    placeholder="ZIP"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Delivery notes">
                  <Input.TextArea
                    value={contact.deliveryInstructions}
                    onChange={(event) =>
                      setContactField(
                        'deliveryInstructions',
                        event.target.value,
                      )
                    }
                    rows={3}
                    placeholder="Gate code, hotel desk, receiving dock, or timing notes"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      </Space>
    </Card>
  );
}

function QuotePanel({
  quote,
  setQuote,
  compact = false,
}: {
  quote: QuoteState;
  setQuote: Dispatch<SetStateAction<QuoteState>>;
  compact?: boolean;
}) {
  const metrics = getQuoteMetrics(quote);
  const topItems = compact ? itemOrder.slice(0, 4) : itemOrder;

  return (
    <Card className="quote-card ant-card-premium">
      <Space orientation="vertical" size={18} className="full-width">
        <div className="quote-heading">
          <div>
            <div className="section-kicker">USA domestic estimate</div>
            <Title level={compact ? 3 : 2}>Quote every state lane</Title>
          </div>
          <Tag color="cyan">50 states + DC</Tag>
        </div>

        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <LocationSelect
              label="Origin"
              value={quote.originState}
              onChange={(originState) =>
                setQuote((current) => ({ ...current, originState }))
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <LocationSelect
              label="Destination"
              value={quote.destinationState}
              onChange={(destinationState) =>
                setQuote((current) => ({ ...current, destinationState }))
              }
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]}>
          {topItems.map((key) => {
            const definition = itemDefinitions[key];
            return (
              <Col xs={24} sm={compact ? 12 : 8} key={key}>
                <button
                  className={`cargo-choice ${quote.counts[key] > 0 ? 'active' : ''}`}
                  type="button"
                  onClick={() => updateCount(setQuote, key, 1)}
                >
                  <span>{definition.icon}</span>
                  <strong>{definition.label}</strong>
                  <small>{definition.max}</small>
                  <b>{quote.counts[key]} selected</b>
                </button>
              </Col>
            );
          })}
        </Row>

        <Space orientation="vertical" size={12} className="full-width">
          <Radio.Group
            className="service-radio full-width"
            optionType="button"
            buttonStyle="solid"
            value={quote.speed}
            onChange={(event) =>
              setQuote((current) => ({
                ...current,
                speed: event.target.value as SpeedKey,
              }))
            }
          >
            {Object.entries(speedDefinitions).map(([key, speed]) => (
              <Radio.Button value={key} key={key}>
                <strong>{speed.label}</strong>
                <small>{speed.detail}</small>
              </Radio.Button>
            ))}
          </Radio.Group>

          <Segmented
            block
            value={quote.carrier}
            onChange={(value) =>
              setQuote((current) => ({
                ...current,
                carrier: value as CarrierKey,
              }))
            }
            options={[
              { label: 'Best rate', value: 'best' },
              { label: 'UPS', value: 'ups' },
              { label: 'FedEx', value: 'fedex' },
            ]}
          />
        </Space>

        <Row gutter={[12, 12]}>
          <Col xs={24} md={compact ? 24 : 8}>
            <Form.Item label="Declared value">
              <Slider
                min={0}
                max={5000}
                step={50}
                value={quote.declaredValue}
                onChange={(declaredValue) =>
                  setQuote((current) => ({ ...current, declaredValue }))
                }
              />
              <Text strong>{formatMoney(quote.declaredValue)}</Text>
            </Form.Item>
          </Col>
          <Col xs={24} md={compact ? 12 : 8}>
            <Checkbox
              checked={quote.pickup}
              onChange={(event) =>
                setQuote((current) => ({
                  ...current,
                  pickup: event.target.checked,
                }))
              }
            >
              Doorstep pickup
            </Checkbox>
          </Col>
          <Col xs={24} md={compact ? 12 : 8}>
            <Checkbox
              checked={quote.protection}
              onChange={(event) =>
                setQuote((current) => ({
                  ...current,
                  protection: event.target.checked,
                }))
              }
            >
              Shipment protection
            </Checkbox>
          </Col>
        </Row>

        <div className="estimate-panel">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={9}>
              <Statistic
                title={`${carrierProfiles[metrics.selectedCarrier].name} estimate`}
                value={metrics.total}
                prefix="$"
                styles={{ content: { color: '#132935', fontWeight: 800 } }}
              />
              <Text type="secondary">{metrics.service}</Text>
            </Col>
            <Col xs={12} md={5}>
              <div className="mini-stat">
                <small>Lane</small>
                <strong>{metrics.routeLabel}</strong>
              </div>
            </Col>
            <Col xs={12} md={5}>
              <div className="mini-stat">
                <small>Zone / miles</small>
                <strong>
                  Zone {metrics.zone} / {metrics.distanceMiles}
                </strong>
              </div>
            </Col>
            <Col xs={24} md={5}>
              <div className="mini-stat">
                <small>ETA</small>
                <strong>{metrics.eta}</strong>
              </div>
            </Col>
          </Row>
        </div>

        <Alert
          type="info"
          showIcon
          title={metrics.availabilityNote}
          description="For exact carrier account pricing, connect UPS and FedEx credentials in the production environment. This UI is already structured for live Rating and Tracking API responses."
        />

        <Button
          type="primary"
          size="large"
          block
          onClick={() => {
            const number = '18623819018';
            const items = Object.entries(quote.counts).filter(([_, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
            const text = `*New Quote Request*\n\n*Lane:* ${metrics.routeLabel}\n*Items:* ${items}\n*Total Est:* $${metrics.total}`;
            window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
          }}
          icon={<ArrowRightOutlined />}
        >
          Send Quote via WhatsApp
        </Button>
      </Space>
    </Card>
  );
}

function CouponInput({ quote, setQuote }: { quote: QuoteState, setQuote: Dispatch<SetStateAction<QuoteState>> }) {
  const applied = quote.couponCode === 'NEW30';

  if (applied) {
    return (
      <div style={{ border: '1px dashed #cbd5e1', padding: '8px 16px', borderRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, backgroundColor: '#f8fafc' }}>
        <div>
          <div style={{ fontWeight: 600, color: '#16a34a' }}>NEW30 Applied!</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>30% off your first shipment</div>
        </div>
        <Button size="small" onClick={() => setQuote(q => ({ ...q, couponCode: undefined }))}>Remove</Button>
      </div>
    );
  }

  return (
    <div style={{ border: '1px dashed #cbd5e1', padding: '8px 16px', borderRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <div style={{ flex: 1, marginRight: 12 }}>
        <div style={{ fontWeight: 600 }}>NEW30</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>30% off your first shipment</div>
      </div>
      <Button type="primary" shape="round" onClick={() => setQuote(q => ({ ...q, couponCode: 'NEW30' }))}>
        Apply
      </Button>
    </div>
  );
}

function CarrierComparison({ metrics }: { metrics: QuoteMetrics }) {
  return (
    <Row gutter={[12, 12]}>
      {(['ups', 'fedex'] as CarrierProvider[]).map((provider) => {
        const rate = metrics.rates[provider];
        const active = metrics.selectedCarrier === provider;

        return (
          <Col xs={24} md={12} key={provider}>
            <div className={`carrier-rate-card ${active ? 'active' : ''}`}>
              <Space align="center" size={12}>
                <span className="service-icon">
                  <TruckOutlined />
                </span>
                <div>
                  <Text strong>{rate.name}</Text>
                  <Paragraph>{rate.service}</Paragraph>
                </div>
              </Space>
              <Statistic
                title={rate.transit}
                value={rate.total}
                prefix="$"
                styles={{ content: { color: active ? '#0f8f93' : '#132935' } }}
              />
              <Descriptions
                column={1}
                size="small"
                items={[
                  {
                    key: 'transport',
                    label: 'Transport',
                    children: formatMoney(rate.transportation),
                  },
                  {
                    key: 'fuel',
                    label: 'Fuel',
                    children: formatMoney(rate.fuel),
                  },
                  {
                    key: 'fees',
                    label: 'Fees',
                    children: formatMoney(rate.accessorials),
                  },
                  {
                    key: 'protection',
                    label: 'Protection',
                    children: formatMoney(rate.protection),
                  },
                  {
                    key: 'discount',
                    label: 'Discount',
                    children: `-${formatMoney(rate.discount)}`,
                  },
                ]}
              />
            </div>
          </Col>
        );
      })}
    </Row>
  );
}

function TrackingPanel({
  shipment,
  setShipment,
}: {
  shipment: Shipment;
  setShipment: Dispatch<SetStateAction<Shipment>>;
}) {
  const [trackingNumber, setTrackingNumber] = useState(shipment.number);
  const [carrier, setCarrier] = useState<TrackingCarrier>('auto');
  const normalizedInput = normalizeTrackingInput(trackingNumber, carrier);

  function runSearch(value = trackingNumber) {
    const normalized = normalizeTrackingInput(value, carrier);
    const requested = normalized.trackingNumber.trim().toUpperCase();
    const demo = sampleShipments.find((item) => item.number === requested);
    setCarrier(normalized.carrier);
    setTrackingNumber(requested || normalized.raw);
    setShipment(demo ?? createFallbackShipment(requested, normalized.carrier));
  }

  return (
    <Card className="tracking-card ant-card-premium">
      <Space orientation="vertical" className="full-width" size={18}>
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={12}>
            <Input.Search
              size="large"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              enterButton="Track"
              prefix={<SearchOutlined />}
              onSearch={runSearch}
              placeholder="COEX-8143-2290, UPS/FedEx number, or carrier tracking link"
            />
          </Col>
          <Col xs={24} lg={12}>
            <Segmented
              block
              value={carrier}
              onChange={(value) => setCarrier(value as TrackingCarrier)}
              options={[
                { label: 'Auto detect', value: 'auto' },
                { label: 'UPS', value: 'ups' },
                { label: 'FedEx', value: 'fedex' },
              ]}
            />
          </Col>
        </Row>

        <div className="carrier-page-actions">
          <Text strong>Need the carrier form?</Text>
          <Space wrap>
            <Button
              href={carrierTrackingPages.ups}
              target="_blank"
              rel="noreferrer"
              icon={<LinkOutlined />}
            >
              Open UPS tracking page
            </Button>
            <Button
              href={carrierTrackingPages.fedex}
              target="_blank"
              rel="noreferrer"
              icon={<LinkOutlined />}
            >
              Open FedEx tracking page
            </Button>
          </Space>
        </div>

        {normalizedInput.isCarrierPage ? (
          <Alert
            type="info"
            showIcon
            title={`${getCarrierName(normalizedInput.carrier)} tracking page detected`}
            description="Open the carrier page to enter the tracking number there, or paste the tracking number here and COEX will prepare the exact carrier handoff link."
          />
        ) : null}

        <div className="tracking-head">
          <div>
            <Tag color={shipment.status.includes('READY') ? 'gold' : 'cyan'}>
              {shipment.status}
            </Tag>
            <Title level={2}>{shipment.number}</Title>
            <Text type="secondary">
              {shipment.origin} to {shipment.destination}
            </Text>
          </div>
          <div className="tracking-actions">
            {shipment.trackingLinks.map((trackingLink) => (
              <Button
                key={trackingLink.url}
                href={trackingLink.url}
                target="_blank"
                rel="noreferrer"
                icon={<LinkOutlined />}
              >
                {trackingLink.label}
              </Button>
            ))}
          </div>
        </div>

        <Progress percent={shipment.progress} status="active" />

        <Row gutter={[18, 18]}>
          <Col xs={24} lg={15}>
            <Timeline
              items={shipment.milestones.map((milestone) => ({
                color: milestone.done ? 'green' : 'gray',
                dot: milestone.done ? (
                  <CheckCircleFilled className="primary-icon" />
                ) : undefined,
                children: (
                  <div>
                    <Text strong>{milestone.title}</Text>
                    <Paragraph className="timeline-detail">
                      {milestone.detail}
                    </Paragraph>
                  </div>
                ),
              }))}
            />
          </Col>
          <Col xs={24} lg={9}>
            <Descriptions
              bordered
              size="small"
              column={1}
              items={[
                { key: 'mode', label: 'Mode', children: shipment.mode },
                { key: 'eta', label: 'ETA', children: shipment.eta },
                { key: 'pieces', label: 'Pieces', children: shipment.pieces },
                {
                  key: 'carrier',
                  label: 'Carrier',
                  children:
                    shipment.carrier === 'ups'
                      ? 'UPS'
                      : shipment.carrier === 'fedex'
                        ? 'FedEx'
                        : 'COEX / auto',
                },
              ]}
            />
            <Divider />
            <Text strong>Documents</Text>
            <ul className="document-list">
              {shipment.documents.map((document) => (
                <li key={document}>{document}</li>
              ))}
            </ul>
            {shipment.exception ? (
              <Alert
                className="tracking-alert"
                type="info"
                showIcon
                title="Tracking note"
                description={shipment.exception}
              />
            ) : null}
          </Col>
        </Row>
      </Space>
    </Card>
  );
}

function CoverageMap({ metrics }: { metrics: QuoteMetrics }) {
  return (
    <div className="coverage-map">
      <div className="map-label origin">
        <EnvironmentOutlined />
        {metrics.origin.city}, {metrics.origin.code}
      </div>
      <div className="map-label destination">
        <TruckOutlined />
        {metrics.destination.city}, {metrics.destination.code}
      </div>
      <div className="map-lane" />
      <div className="map-data-card">
        <Text strong>Domestic lane</Text>
        <Title level={3}>Zone {metrics.zone}</Title>
        <Paragraph>
          {metrics.distanceMiles} modeled miles, {metrics.billableWeight} lb
          billable, {carrierProfiles[metrics.selectedCarrier].name} selected.
        </Paragraph>
      </div>
    </div>
  );
}

export function HomePage() {
  const [quote, setQuote] = useQuoteState();
  const [shipment, setShipment] = useState<Shipment>(sampleShipments[0]);
  const metrics = getQuoteMetrics(quote);
  useWebMcpTools({ quote, setQuote, setShipment });

  return (
    <ShippingFrame active="home">
      <section className="hero-section hero-section-morph">
        <StateDeliveryHero metrics={metrics} />
      </section>

      <section className="visual-band">
        <div className="visual-card">
          <Image
            src="/hero-logistics.png"
            alt="Modern COEX shipping operations with parcels and domestic carrier flow"
            width={1600}
            height={960}
            className="hero-image"
            priority
          />
          <div className="visual-overlay">
            <div className="route-line">
              <span>{formatLocation(quote.originState)}</span>
              <i />
              <span>{formatLocation(quote.destinationState)}</span>
            </div>
            <Row gutter={[8, 8]}>
              {[
                ['Best carrier', carrierProfiles[metrics.selectedCarrier].name],
                ['Estimate', formatMoney(metrics.total)],
                ['Delivery', metrics.eta],
                ['Zone', String(metrics.zone)],
              ].map(([label, value]) => (
                <Col xs={12} md={6} key={label}>
                  <div className="mini-stat">
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Pricing engine</div>
            <Title level={2}>Domestic estimates that explain the math.</Title>
            <Paragraph>
              The calculator applies lane distance, zone, dimensional weight,
              service speed, carrier profile, pickup, residential delivery,
              non-contiguous state handling, and declared value protection.
            </Paragraph>
          </div>
          <Button href="/quote" icon={<ArrowRightOutlined />}>
            Open quote tool
          </Button>
        </div>
        <Row gutter={[18, 18]} align="stretch">
          <Col xs={24} lg={13}>
            <CoverageMap metrics={metrics} />
          </Col>
          <Col xs={24} lg={11}>
            <CarrierComparison metrics={metrics} />
          </Col>
        </Row>
      </section>

      <section className="content-band alt">
        <div className="section-heading">
          <div>
            <div className="section-kicker">US coverage</div>
            <Title level={2}>Every state location is available.</Title>
            <Paragraph>
              Origin and destination selectors include all 50 states and
              Washington, DC. Alaska and Hawaii are priced as non-contiguous
              remote lanes.
            </Paragraph>
          </div>
        </div>
        <div className="state-grid">
          {usLocations.map((location) => (
            <div className="state-pill" key={location.code}>
              <strong>{location.code}</strong>
              <span>
                {location.city}, {location.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Services and integrations</div>
            <Title level={2}>
              Built for quotes, booking, documents, and tracking.
            </Title>
            <Paragraph>
              COEX details from the reference site are focused into a US
              operating model with UPS and FedEx readiness.
            </Paragraph>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          {coexServices.map((service) => (
            <Col xs={24} md={12} lg={8} key={service.title}>
              <Card className="service-card">
                <Space orientation="vertical" size={12}>
                  <span className="service-icon">{service.icon}</span>
                  <Title level={4}>{service.title}</Title>
                  <Paragraph>{service.text}</Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
        <Divider />
        <Row gutter={[16, 16]}>
          {integrationCards.map((integration) => (
            <Col xs={24} md={12} lg={8} key={integration.title}>
              <Card className="integration-card">
                <Space align="start" size={12}>
                  <span className="service-icon">{integration.icon}</span>
                  <div>
                    <Text strong>{integration.title}</Text>
                    <Paragraph>{integration.text}</Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="content-band alt">
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} lg={10}>
            <div className="section-kicker">Live tracking console</div>
            <Title level={2}>
              Track COEX demos or hand off real carrier numbers.
            </Title>
            <Paragraph>
              Try COEX-8143-2290, LLX-8143-2290, a UPS 1Z number, or a numeric
              FedEx tracking number. The app detects the likely carrier and
              provides direct tracking links.
            </Paragraph>
          </Col>
          <Col xs={24} lg={14}>
            <TrackingPanel shipment={shipment} setShipment={setShipment} />
          </Col>
        </Row>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Operating flow</div>
            <Title level={2}>From quote to proof of delivery.</Title>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          {processSteps.map(([step, title, text]) => (
            <Col xs={24} md={12} lg={6} key={step}>
              <Card className="process-card">
                <Text className="process-step">{step}</Text>
                <Title level={4}>{title}</Title>
                <Paragraph>{text}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="content-band alt">
        <Row gutter={[18, 18]}>
          <Col xs={24} lg={10}>
            <div className="section-kicker">Solutions</div>
            <Title level={2}>
              Flexible enough for travel, retail, and freight teams.
            </Title>
          </Col>
          <Col xs={24} lg={14}>
            <Row gutter={[14, 14]}>
              {coexSolutions.map((solution) => (
                <Col xs={24} md={12} key={solution.title}>
                  <Card className="solution-card">
                    <Space orientation="vertical" size={12}>
                      <span className="service-icon">{solution.icon}</span>
                      <Title level={4}>{solution.title}</Title>
                      <Paragraph>{solution.text}</Paragraph>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <div>
            <div className="section-kicker">FAQ</div>
            <Title level={2}>Clear details before checkout.</Title>
          </div>
        </div>
        <Collapse className="faq-collapse" items={faqItems} />
      </section>
    </ShippingFrame>
  );
}

export function QuotePage() {
  const [quote, setQuote] = useQuoteState();
  const [, setShipment] = useState<Shipment>(sampleShipments[0]);
  const [quoteContact, setQuoteContact] =
    useState<QuoteContactState>(initialQuoteContact);
  const [saved, setSaved] = useState(false);
  const metrics = getQuoteMetrics(quote);
  const quoteContactComplete = isQuoteContactComplete(quoteContact);
  useWebMcpTools({ quote, setQuote, setShipment });

  function setQuoteOriginState(originState: string) {
    const location = locationByCode[originState];
    setQuote((current) => ({ ...current, originState }));
    setQuoteContact((current) => ({
      ...current,
      pickupState: originState,
      pickupCity: location.city,
      pickupZip: location.zip,
    }));
  }

  function setQuoteDestinationState(destinationState: string) {
    const location = locationByCode[destinationState];
    setQuote((current) => ({ ...current, destinationState }));
    setQuoteContact((current) => ({
      ...current,
      deliveryState: destinationState,
      deliveryCity: location.city,
      deliveryZip: location.zip,
    }));
  }

  return (
    <ShippingFrame active="quote">
      <section className="page-hero">
        <Tag color="cyan" icon={<DollarCircleOutlined />}>
          Domestic rate calculator
        </Tag>
        <Title>Price a USA shipment with carrier comparison.</Title>
        <Paragraph>
          Select any US origin and destination, add items, choose service speed,
          and compare modeled UPS and FedEx totals.
        </Paragraph>
        <HeroStatStrip
          items={[
            {
              icon: <EnvironmentOutlined />,
              label: 'Coverage',
              value: '50 states + DC',
            },
            {
              icon: <DollarCircleOutlined />,
              label: 'Rate model',
              value: 'Zone + DIM',
            },
            {
              icon: <TruckOutlined />,
              label: 'Carriers',
              value: 'UPS + FedEx',
            },
          ]}
        />
      </section>

      <section className="workspace-section">
        <Row gutter={[20, 20]} align="top">
          <Col xs={24} lg={15}>
            <Form layout="vertical" className="full-width">
              <Space orientation="vertical" size={18} className="full-width">
              <QuoteContactForm
                contact={quoteContact}
                setContact={setQuoteContact}
                setQuote={setQuote}
              />

              <Card
                title="2. Origin and destination"
                className="ant-card-premium"
              >
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12}>
                    <LocationSelect
                      label="Origin state location"
                      value={quote.originState}
                      onChange={setQuoteOriginState}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <LocationSelect
                      label="Destination state location"
                      value={quote.destinationState}
                      onChange={setQuoteDestinationState}
                    />
                  </Col>
                </Row>
                <Alert
                  type="success"
                  showIcon
                  title="USA-only service"
                  description="All estimates are domestic United States lanes. Puerto Rico, US territories, and international shipments are intentionally excluded from this calculator."
                />
              </Card>

              <Card title="3. Items" className="ant-card-premium">
                <Row gutter={[12, 12]}>
                  {itemOrder.map((key) => {
                    const definition = itemDefinitions[key];
                    return (
                      <Col xs={24} md={12} key={key}>
                        <div className="item-row">
                          <Space align="center">
                            <span className="item-icon">{definition.icon}</span>
                            <span>
                              <Text strong>{definition.label}</Text>
                              <small>{definition.max}</small>
                            </span>
                          </Space>
                          <Space.Compact>
                            <Button
                              aria-label={`Remove ${definition.label}`}
                              icon={<MinusOutlined />}
                              onClick={() => updateCount(setQuote, key, -1)}
                            />
                            <InputNumber
                              value={quote.counts[key]}
                              min={0}
                              max={12}
                              readOnly
                            />
                            <Button
                              aria-label={`Add ${definition.label}`}
                              icon={<PlusOutlined />}
                              onClick={() => updateCount(setQuote, key, 1)}
                            />
                          </Space.Compact>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card>

              <Card
                title="4. Service, carrier, and options"
                className="ant-card-premium"
              >
                <Space orientation="vertical" size={18} className="full-width">
                  <Radio.Group
                    className="service-radio full-width"
                    optionType="button"
                    buttonStyle="solid"
                    value={quote.speed}
                    onChange={(event) =>
                      setQuote((current) => ({
                        ...current,
                        speed: event.target.value as SpeedKey,
                      }))
                    }
                  >
                    {Object.entries(speedDefinitions).map(([key, speed]) => (
                      <Radio.Button value={key} key={key}>
                        <strong>{speed.label}</strong>
                        <small>{speed.detail}</small>
                      </Radio.Button>
                    ))}
                  </Radio.Group>

                  <Segmented
                    block
                    value={quote.carrier}
                    onChange={(value) =>
                      setQuote((current) => ({
                        ...current,
                        carrier: value as CarrierKey,
                      }))
                    }
                    options={[
                      { label: 'Best rate', value: 'best' },
                      { label: 'UPS', value: 'ups' },
                      { label: 'FedEx', value: 'fedex' },
                    ]}
                  />

                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={8}>
                      <Form.Item label="Declared value">
                        <Slider
                          min={0}
                          max={10000}
                          step={50}
                          value={quote.declaredValue}
                          onChange={(declaredValue) =>
                            setQuote((current) => ({
                              ...current,
                              declaredValue,
                            }))
                          }
                        />
                        <Text strong>{formatMoney(quote.declaredValue)}</Text>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Checkbox
                        checked={quote.pickup}
                        onChange={(event) =>
                          setQuote((current) => ({
                            ...current,
                            pickup: event.target.checked,
                          }))
                        }
                      >
                        Doorstep pickup
                      </Checkbox>
                      <Paragraph className="check-help">
                        Adds carrier pickup handling at origin.
                      </Paragraph>
                    </Col>
                    <Col xs={24} md={8}>
                      <Checkbox
                        checked={quote.residential}
                        onChange={(event) =>
                          setQuote((current) => ({
                            ...current,
                            residential: event.target.checked,
                          }))
                        }
                      >
                        Residential delivery
                      </Checkbox>
                      <Paragraph className="check-help">
                        Applies delivery-area handling.
                      </Paragraph>
                    </Col>
                    <Col xs={24} md={8}>
                      <Checkbox
                        checked={quote.protection}
                        onChange={(event) =>
                          setQuote((current) => ({
                            ...current,
                            protection: event.target.checked,
                          }))
                        }
                      >
                        Shipment protection
                      </Checkbox>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="Pickup date">
                        <Input
                          type="date"
                          value={quote.pickupDate}
                          onChange={(event) =>
                            setQuote((current) => ({
                              ...current,
                              pickupDate: event.target.value,
                            }))
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="Pickup window">
                        <Select
                          value={quote.pickupWindow}
                          onChange={(pickupWindow) =>
                            setQuote((current) => ({
                              ...current,
                              pickupWindow,
                            }))
                          }
                          options={[
                            '8:00 AM - 10:00 AM',
                            '10:00 AM - 12:00 PM',
                            '12:00 PM - 2:00 PM',
                            '2:00 PM - 4:00 PM',
                            '4:00 PM - 6:00 PM',
                          ].map((value) => ({ value, label: value }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="Customer type">
                        <Segmented
                          block
                          value={quote.customerType}
                          onChange={(value) =>
                            setQuote((current) => ({
                              ...current,
                              customerType: value as CustomerType,
                            }))
                          }
                          options={[
                            { label: 'Individual', value: 'individual' },
                            { label: 'Business', value: 'business' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Space>
            </Form>
          </Col>

          <Col xs={24} lg={9}>
            <Card className="summary-card ant-card-premium">
              <div className="section-kicker">Shipment summary</div>
              <Statistic
                title={`${carrierProfiles[metrics.selectedCarrier].name} estimated total`}
                value={metrics.total}
                prefix="$"
                styles={{
                  content: { fontSize: 48, color: '#132935', fontWeight: 800 },
                }}
              />
              <Descriptions
                column={1}
                size="small"
                items={[
                  {
                    key: 'items',
                    label: 'Items',
                    children: `${metrics.packages} selected`,
                  },
                  {
                    key: 'actual',
                    label: 'Actual weight',
                    children: `${metrics.actualWeight} lb`,
                  },
                  {
                    key: 'dim',
                    label: 'DIM weight',
                    children: `${metrics.dimWeight} lb`,
                  },
                  {
                    key: 'billable',
                    label: 'Billable weight',
                    children: `${metrics.billableWeight} lb`,
                  },
                  {
                    key: 'zone',
                    label: 'Zone',
                    children: `Zone ${metrics.zone} / ${metrics.distanceMiles} miles`,
                  },
                  {
                    key: 'pickup',
                    label: 'Pickup',
                    children: quote.pickup
                      ? formatMoney(metrics.pickupFee)
                      : 'Drop-off selected',
                  },
                  {
                    key: 'residential',
                    label: 'Residential',
                    children: quote.residential
                      ? formatMoney(metrics.residentialFee)
                      : 'Commercial selected',
                  },
                  {
                    key: 'protection',
                    label: 'Protection',
                    children: quote.protection
                      ? formatMoney(metrics.protectionFee)
                      : 'Not added',
                  },
                  {
                    key: 'savings',
                    label: 'Benchmark savings',
                    children: formatMoney(metrics.savings),
                  },
                  {
                    key: 'date',
                    label: 'Pickup',
                    children: `${quote.pickupDate} / ${quote.pickupWindow}`,
                  },
                  {
                    key: 'shipper',
                    label: 'Shipper',
                    children: quoteContact.shipperName || 'Required',
                  },
                  {
                    key: 'recipient',
                    label: 'Recipient',
                    children: quoteContact.recipientName || 'Required',
                  },
                  {
                    key: 'pickupAddress',
                    label: 'Pickup address',
                    children: formatAddressLine({
                      street: quoteContact.pickupStreet,
                      unit: quoteContact.pickupUnit,
                      city: quoteContact.pickupCity,
                      state: quoteContact.pickupState,
                      zip: quoteContact.pickupZip,
                    }),
                  },
                  {
                    key: 'deliveryAddress',
                    label: 'Delivery address',
                    children: formatAddressLine({
                      street: quoteContact.deliveryStreet,
                      unit: quoteContact.deliveryUnit,
                      city: quoteContact.deliveryCity,
                      state: quoteContact.deliveryState,
                      zip: quoteContact.deliveryZip,
                    }),
                  },
                ]}
              />
              <div className="rate-intelligence">
                <Text strong>Lane intelligence</Text>
                <div className="rate-intelligence-grid">
                  <span>
                    <small>Route</small>
                    <b>{metrics.routeLabel}</b>
                  </span>
                  <span>
                    <small>Transit</small>
                    <b>{metrics.rates[metrics.selectedCarrier].transit}</b>
                  </span>
                  <span>
                    <small>Non-contiguous fee</small>
                    <b>{formatMoney(Math.max(0, metrics.remoteFee))}</b>
                  </span>
                </div>
              </div>
              <CarrierComparison metrics={metrics} />
              <Space orientation="vertical" className="full-width" size={12}>
                <CouponInput quote={quote} setQuote={setQuote} />
                {metrics.couponDiscount ? (
                  <div style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600, marginTop: -8 }}>
                    🎉 You saved ${formatMoney(metrics.couponDiscount)}!
                  </div>
                ) : null}
                {!quoteContactComplete ? (
                  <Alert
                    type="warning"
                    showIcon
                    title="Complete customer and address details before saving this estimate."
                  />
                ) : null}
                <Button
                  type="primary"
                  block
                  disabled={metrics.packages === 0 || !quoteContactComplete}
                  onClick={() => {
                    const number = '18623819018';
                    const items = Object.entries(quote.counts).filter(([_, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
                    const text = `*New Quote Request*\n\n*Shipper:* ${quoteContact.shipperName}\n*Email:* ${quoteContact.shipperEmail}\n*Phone:* ${quoteContact.shipperPhone}\n\n*Pickup:* ${quoteContact.pickupStreet}, ${quoteContact.pickupCity}, ${quoteContact.pickupState} ${quoteContact.pickupZip}\n*Delivery:* ${quoteContact.deliveryStreet}, ${quoteContact.deliveryCity}, ${quoteContact.deliveryState} ${quoteContact.deliveryZip}\n\n*Items:* ${items}\n*Total Est:* $${metrics.total}`;
                    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
                    setSaved(true);
                  }}
                  icon={<FileDoneOutlined />}
                >
                  Send Quote via WhatsApp
                </Button>
                <Button block href="/book" icon={<ArrowRightOutlined />}>
                  Continue to booking
                </Button>
                {saved ? (
                  <Alert
                    type="success"
                    showIcon
                    title={`Quote saved locally for ${quoteContact.shipperName}.`}
                  />
                ) : null}
              </Space>
            </Card>
          </Col>
        </Row>
      </section>
    </ShippingFrame>
  );
}

export function TrackingPage() {
  const [quote, setQuote] = useQuoteState();
  const [shipment, setShipment] = useState<Shipment>(sampleShipments[0]);
  useWebMcpTools({ quote, setQuote, setShipment });

  return (
    <ShippingFrame active="tracking">
      <section className="page-hero tracking-hero">
        <Tag color="blue" icon={<SearchOutlined />}>
          UPS and FedEx tracking
        </Tag>
        <Title>Track packages with COEX, UPS, and FedEx handoff.</Title>
        <Paragraph>
          Enter a COEX demo number, UPS 1Z tracking number, or FedEx numeric
          tracking number. The interface detects the carrier and provides direct
          live carrier tracking links.
        </Paragraph>
        <HeroStatStrip
          items={[
            {
              icon: <SearchOutlined />,
              label: 'Detection',
              value: 'Auto / UPS / FedEx',
            },
            {
              icon: <LinkOutlined />,
              label: 'Handoff',
              value: 'Carrier links',
            },
            {
              icon: <FileDoneOutlined />,
              label: 'Records',
              value: 'Docs + milestones',
            },
          ]}
        />
      </section>
      <section className="workspace-section">
        <TrackingPanel shipment={shipment} setShipment={setShipment} />
      </section>
    </ShippingFrame>
  );
}

export function BookPage() {
  const [quote, setQuote] = useQuoteState();
  const [, setShipment] = useState<Shipment>(sampleShipments[0]);
  const [booking, setBooking] = useState<BookingState>(initialBooking);
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const metrics = getQuoteMetrics(quote);
  useWebMcpTools({ quote, setQuote, setShipment });

  const stepItems = [
    { title: 'Pickup details' },
    { title: 'Destination' },
    { title: 'Cargo plan' },
    { title: 'Confirm' },
  ];

  function setBookingField(key: keyof BookingState, value: string) {
    setBooking((current) => ({ ...current, [key]: value }));
  }

  const formFields =
    step === 0
      ? [
          ['pickupAddress', 'Pickup address', '418 W 12th St'],
          ['pickupCity', 'Pickup city', 'Austin'],
          ['pickupState', 'State', 'TX'],
          ['pickupZip', 'ZIP code', '78701'],
        ]
      : [
          ['destinationAddress', 'Destination address', '1 World Way'],
          ['destinationCity', 'Destination city', 'Los Angeles'],
          ['destinationState', 'State', 'CA'],
          ['destinationZip', 'ZIP code', '90045'],
        ];

  return (
    <ShippingFrame active="book">
      <section className="page-hero">
        <Tag color="cyan" icon={<TruckOutlined />}>
          Book a USA pickup
        </Tag>
        <Title>Pickup, lane, cargo, confirmation.</Title>
        <Paragraph>
          A four-step booking workflow modeled from the COEX reference and
          expanded with domestic estimate, carrier comparison, protection, and
          contact details.
        </Paragraph>
        <HeroStatStrip
          items={[
            {
              icon: <EnvironmentOutlined />,
              label: 'Lane',
              value: metrics.routeLabel,
            },
            {
              icon: <DollarCircleOutlined />,
              label: 'Estimate',
              value: formatMoney(metrics.total),
            },
            {
              icon: <FileDoneOutlined />,
              label: 'Checkout',
              value: '4 steps',
            },
          ]}
        />
      </section>

      <section className="workspace-section">
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={8}>
            <Card className="ant-card-premium sticky-panel">
              <Steps current={step} orientation="vertical" items={stepItems} />
              <Divider />
              <Statistic
                title="Live estimate"
                value={metrics.total}
                prefix="$"
              />
              <Text type="secondary">
                {metrics.packages} items -{' '}
                {carrierProfiles[metrics.selectedCarrier].name}
              </Text>
              <div className="booking-preview-lane">
                <TruckOutlined />
                <span>{formatLocation(quote.originState)}</span>
                <i />
                <span>{formatLocation(quote.destinationState)}</span>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card className="ant-card-premium">
              {confirmed ? (
                <Result
                  status="success"
                  title="Demo booking created"
                  subTitle="Confirmation COEX-DEMO-2609 is ready with digital label, documents, carrier handoff, and tracking staged locally."
                  extra={[
                    <Button type="primary" href="/tracking" key="track">
                      Track booking
                    </Button>,
                    <Button href="/quote" key="quote">
                      Create another quote
                    </Button>,
                  ]}
                />
              ) : (
                <Space orientation="vertical" size={20} className="full-width">
                  <Title level={3}>{stepItems[step].title}</Title>
                  {step < 2 ? (
                    <Row gutter={[12, 12]}>
                      {formFields.map(([key, label, placeholder]) => (
                        <Col xs={24} md={12} key={key}>
                          <Form.Item label={label}>
                            {key === 'pickupAddress' || key === 'destinationAddress' ? (
                              <AddressAutocomplete
                                value={booking[key as keyof BookingState]}
                                placeholder={placeholder}
                                onChange={(val) => setBookingField(key as keyof BookingState, val)}
                                onSelectAddress={(data) => {
                                  const prefix = key.replace('Address', '');
                                  setBookingField(key as keyof BookingState, data.address);
                                  setBookingField(`${prefix}City` as keyof BookingState, data.city);
                                  setBookingField(`${prefix}State` as keyof BookingState, data.state);
                                  setBookingField(`${prefix}Zip` as keyof BookingState, data.zip);
                                }}
                              />
                            ) : (
                              <Input
                                placeholder={placeholder}
                                value={booking[key as keyof BookingState]}
                                onChange={(event) =>
                                  setBookingField(
                                    key as keyof BookingState,
                                    event.target.value,
                                  )
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>
                  ) : null}

                  {step === 2 ? (
                    <Row gutter={[12, 12]}>
                      {(['checked', 'box', 'golf', 'ski'] as ItemKey[]).map(
                        (key) => (
                          <Col xs={24} md={12} key={key}>
                            <div className="booking-item">
                              <Space>
                                <span className="item-icon">
                                  {itemDefinitions[key].icon}
                                </span>
                                <Text strong>{itemDefinitions[key].label}</Text>
                              </Space>
                              <Space.Compact>
                                <Button
                                  icon={<MinusOutlined />}
                                  onClick={() => updateCount(setQuote, key, -1)}
                                />
                                <InputNumber
                                  value={quote.counts[key]}
                                  min={0}
                                  max={12}
                                  readOnly
                                />
                                <Button
                                  icon={<PlusOutlined />}
                                  onClick={() => updateCount(setQuote, key, 1)}
                                />
                              </Space.Compact>
                            </div>
                          </Col>
                        ),
                      )}
                      <Col span={24}>
                        <Checkbox
                          checked={quote.protection}
                          onChange={(event) =>
                            setQuote((current) => ({
                              ...current,
                              protection: event.target.checked,
                            }))
                          }
                        >
                          Add shipment protection
                        </Checkbox>
                      </Col>
                    </Row>
                  ) : null}

                  {step === 3 ? (
                    <Space
                      orientation="vertical"
                      className="full-width"
                      size={16}
                    >
                      <Row gutter={[12, 12]}>
                        {[
                          ['contactName', 'Contact name'],
                          ['contactEmail', 'Email address'],
                          ['phone', 'Phone'],
                          ['notes', 'Delivery notes'],
                        ].map(([key, label]) => (
                          <Col xs={24} md={12} key={key}>
                            <Form.Item label={label}>
                              <Input
                                value={booking[key as keyof BookingState]}
                                onChange={(event) =>
                                  setBookingField(
                                    key as keyof BookingState,
                                    event.target.value,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                      <Alert
                        type="info"
                        showIcon
                        title="Booking preview"
                        description={`Pickup from ${booking.pickupAddress}, ${booking.pickupCity}, ${booking.pickupState} to ${booking.destinationAddress}, ${booking.destinationCity}, ${booking.destinationState}. Estimated ${formatMoney(metrics.total)} with ${metrics.service}.`}
                      />
                    </Space>
                  ) : null}

                  <CouponInput quote={quote} setQuote={setQuote} />
                  {metrics.couponDiscount ? (
                    <div style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600, marginBottom: 16 }}>
                      🎉 You saved ${formatMoney(metrics.couponDiscount)}!
                    </div>
                  ) : null}
                  <div className="wizard-actions">
                    <Button
                      disabled={step === 0}
                      onClick={() =>
                        setStep((current) => Math.max(0, current - 1))
                      }
                    >
                      Back
                    </Button>
                    {step < 3 ? (
                      <Button
                        type="primary"
                        onClick={() =>
                          setStep((current) => Math.min(3, current + 1))
                        }
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button type="primary" onClick={() => {
                        const number = '18623819018';
                        const items = Object.entries(quote.counts).filter(([_, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
                        const text = `*New Booking*\n\n*Shipper:* ${booking.contactName} (${booking.contactEmail}, ${booking.phone})\n*Pickup:* ${booking.pickupAddress}, ${booking.pickupCity}, ${booking.pickupState} ${booking.pickupZip}\n*Delivery:* ${booking.destinationAddress}, ${booking.destinationCity}, ${booking.destinationState} ${booking.destinationZip}\n\n*Items:* ${items}\n*Total Cost:* $${metrics.total}`;
                        window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
                        setConfirmed(true);
                      }}>
                        Confirm Booking via WhatsApp
                      </Button>
                    )}
                  </div>
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </section>
    </ShippingFrame>
  );
}

export function LoginPage() {
  const [quote, setQuote] = useQuoteState();
  const [, setShipment] = useState<Shipment>(sampleShipments[0]);
  const [message, setMessage] = useState('');
  useWebMcpTools({ quote, setQuote, setShipment });

  const tabItems = useMemo(
    () => [
      {
        key: 'signin',
        label: 'Sign in',
        children: (
          <Form layout="vertical" className="login-form">
            <Form.Item label="Email address">
              <Input prefix={<MailOutlined />} placeholder="you@company.com" />
            </Form.Item>
            <Form.Item label="Password">
              <Input.Password placeholder="At least 8 characters" />
            </Form.Item>
            <Button
              block
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => setMessage('Signed in locally for this demo.')}
            >
              Continue
            </Button>
            <Button
              block
              type="text"
              onClick={() => setMessage('Password recovery opened locally.')}
            >
              Forgot password?
            </Button>
          </Form>
        ),
      },
      {
        key: 'create',
        label: 'Create account',
        children: (
          <Form layout="vertical" className="login-form">
            <Form.Item label="Full name">
              <Input prefix={<UserOutlined />} placeholder="Your name" />
            </Form.Item>
            <Form.Item label="Email address">
              <Input prefix={<MailOutlined />} placeholder="you@company.com" />
            </Form.Item>
            <Form.Item label="Password">
              <Input.Password placeholder="At least 8 characters" />
            </Form.Item>
            <Button
              block
              type="primary"
              onClick={() => setMessage('Demo account created locally.')}
            >
              Create demo account
            </Button>
          </Form>
        ),
      },
    ],
    [],
  );

  return (
    <ShippingFrame active="login">
      <section className="login-section">
        <Row gutter={[28, 28]} align="middle">
          <Col xs={24} lg={12}>
            <Tag color="cyan" icon={<UserOutlined />}>
              Sign in to COEX
            </Tag>
            <Title>
              Book pickups, manage saved quotes, and track every parcel.
            </Title>
            <Paragraph>
              The account hub mirrors the reference sign-in flow: sign in,
              create account, forgot password, and continue as guest. This demo
              does not transmit credentials.
            </Paragraph>
            <HeroStatStrip
              items={[
                {
                  icon: <DollarCircleOutlined />,
                  label: 'Saved quotes',
                  value: '4 active',
                },
                {
                  icon: <TruckOutlined />,
                  label: 'Open shipments',
                  value: '2 moving',
                },
                {
                  icon: <SafetyCertificateOutlined />,
                  label: 'Security',
                  value: 'Local demo',
                },
              ]}
            />
            <Row gutter={[12, 12]}>
              {[
                ['Saved quotes', 4, <DollarCircleOutlined key="saved" />],
                ['Open shipments', 2, <TruckOutlined key="open" />],
                ['Documents', 9, <FileDoneOutlined key="docs" />],
              ].map(([title, value, icon]) => (
                <Col xs={24} sm={8} key={title as string}>
                  <Card className="metric-card">
                    <Statistic
                      title={title as string}
                      value={value as number}
                      prefix={icon}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs={24} lg={12}>
            <Card className="login-card ant-card-premium">
              <Title level={3}>Welcome to COEX Shipping</Title>
              <Paragraph>
                Continue securely or use guest checkout to stage a shipment.
              </Paragraph>
              <Tabs items={tabItems} defaultActiveKey="signin" />
              <Divider>or</Divider>
              <Button
                block
                size="large"
                icon={<QrcodeOutlined />}
                onClick={() =>
                  setMessage('Guest checkout enabled for this visit.')
                }
              >
                Continue as guest
              </Button>
              {message ? (
                <Alert
                  className="login-alert"
                  type="success"
                  showIcon
                  title={message}
                />
              ) : null}
            </Card>
          </Col>
        </Row>
      </section>
    </ShippingFrame>
  );
}

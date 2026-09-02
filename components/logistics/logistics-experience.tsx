'use client';

import {
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleFilled,
  ClusterOutlined,
  CloudServerOutlined,
  CompassOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  GlobalOutlined,
  InboxOutlined,
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
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
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

type QuoteState = {
  counts: Record<ItemKey, number>;
  origin: string;
  destination: string;
  pickupDate: string;
  pickupWindow: string;
  speed: SpeedKey;
  protection: boolean;
  pickup: boolean;
  customerType: CustomerType;
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

type Shipment = {
  number: string;
  status: string;
  progress: number;
  origin: string;
  destination: string;
  mode: string;
  eta: string;
  pieces: string;
  documents: string[];
  exception?: string;
  milestones: Array<{
    title: string;
    detail: string;
    done: boolean;
  }>;
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
  origin: 'Shanghai, CN',
  destination: 'Los Angeles, US',
  pickupDate: '2026-09-09',
  pickupWindow: '10:00 AM - 12:00 PM',
  speed: 'standard',
  protection: true,
  pickup: false,
  customerType: 'business',
};

const initialBooking: BookingState = {
  pickupAddress: '418 W 12th St',
  pickupCity: 'Austin',
  pickupState: 'TX',
  pickupZip: '78701',
  destinationAddress: '1 World Way',
  destinationCity: 'Los Angeles',
  destinationState: 'CA',
  destinationZip: '90045',
  contactName: 'Guest shipper',
  contactEmail: 'shipper@example.com',
  phone: '(862) 381-9018',
  notes: 'Hold for destination contact if delivery desk is closed.',
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

const itemDefinitions: Record<
  ItemKey,
  {
    label: string;
    sublabel: string;
    max: string;
    weight: number;
    base: number;
    icon: ReactNode;
  }
> = {
  carryOn: {
    label: 'Carry-on',
    sublabel: 'Compact luggage',
    max: 'Up to 25 lb / 49 in',
    weight: 25,
    base: 23,
    icon: <InboxOutlined />,
  },
  checked: {
    label: 'Checked',
    sublabel: 'Standard suitcase',
    max: 'Up to 50 lb / 62 in',
    weight: 50,
    base: 39,
    icon: <InboxOutlined />,
  },
  oversize: {
    label: 'Oversize',
    sublabel: 'Large luggage',
    max: 'Up to 75 lb / 71 in',
    weight: 75,
    base: 64,
    icon: <ShoppingOutlined />,
  },
  box: {
    label: 'Box',
    sublabel: 'Cartons and cases',
    max: 'Up to 50 lb / 62 in',
    weight: 50,
    base: 36,
    icon: <ShopOutlined />,
  },
  golf: {
    label: 'Golf',
    sublabel: 'Golf bags and clubs',
    max: 'Up to 50 lb / 75 in',
    weight: 50,
    base: 52,
    icon: <CompassOutlined />,
  },
  ski: {
    label: 'Ski / Snowboard',
    sublabel: 'Skis, boards, and boot bags',
    max: 'Up to 50 lb / 75 in',
    weight: 50,
    base: 58,
    icon: <CloudServerOutlined />,
  },
  envelope: {
    label: 'Envelope',
    sublabel: 'Documents and flat items',
    max: 'Up to 2 lb',
    weight: 2,
    base: 14,
    icon: <FileDoneOutlined />,
  },
};

const speedDefinitions: Record<
  SpeedKey,
  { label: string; detail: string; multiplier: number; eta: string }
> = {
  standard: {
    label: 'Standard',
    detail: 'Next available working day',
    multiplier: 1,
    eta: '3-5 business days',
  },
  nextDay: {
    label: 'Next day',
    detail: 'Guaranteed next working day',
    multiplier: 1.45,
    eta: 'next working day',
  },
  sameDay: {
    label: 'Same day',
    detail: 'Before the 3:00 PM cutoff',
    multiplier: 1.92,
    eta: 'same day',
  },
};

const coexMetrics = [
  ['50+', 'Countries'],
  ['10K+', 'Shipments'],
  ['99%', 'On-Time Performance'],
  ['24/7', 'Visibility'],
];

const coexServices = [
  {
    title: 'Ocean Freight',
    text: 'FCL and LCL sea freight on vetted carrier space, with lane planning and port coordination.',
    icon: <GlobalOutlined />,
  },
  {
    title: 'Air Freight',
    text: 'Scheduled and priority uplift for time-critical, high-value or perishable cargo.',
    icon: <SendOutlined />,
  },
  {
    title: 'Road Transportation',
    text: 'Inland drayage, line-haul and final-mile delivery managed end to end.',
    icon: <TruckOutlined />,
  },
  {
    title: 'Warehousing & Distribution',
    text: 'Secure storage, inventory accuracy and order fulfilment close to your customers.',
    icon: <BankOutlined />,
  },
  {
    title: 'Customs & Documentation',
    text: 'Customs clearance, tariff classification and complete compliant paperwork.',
    icon: <FileDoneOutlined />,
  },
  {
    title: 'End-to-End Logistics',
    text: 'One accountable team managing every leg from origin pickup to final delivery.',
    icon: <ClusterOutlined />,
  },
];

const coexSolutions = [
  {
    title: 'Retail & E-commerce',
    text: 'Peak-season capacity with flexible ocean-air blends and forward stock positions.',
    icon: <ShoppingOutlined />,
  },
  {
    title: 'Manufacturing',
    text: 'Inbound component flows sequenced to production schedules.',
    icon: <CloudServerOutlined />,
  },
  {
    title: 'Healthcare & Life Sciences',
    text: 'Temperature discipline, chain of custody and priority uplift.',
    icon: <SafetyCertificateOutlined />,
  },
  {
    title: 'Energy & Project Cargo',
    text: 'Out-of-gauge and breakbulk moves engineered lane by lane.',
    icon: <ThunderboltOutlined />,
  },
];

const processSteps = [
  ['01', 'Request a Quote', 'Share the cargo, the lane and the deadline.'],
  ['02', 'Plan', 'We build the routing, mode mix and documentation plan.'],
  ['03', 'Ship', 'Cargo moves through our carrier and partner network.'],
  ['04', 'Track & Deliver', 'Milestones, exceptions and proof of delivery.'],
];

const sampleShipments: Shipment[] = [
  {
    number: 'COEX-8143-2290',
    status: 'IN TRANSIT',
    progress: 60,
    origin: 'Shanghai, CN',
    destination: 'Los Angeles, US',
    mode: "Ocean / FCL 40'",
    eta: '29 Mar',
    pieces: '1 container',
    documents: ['Bill of lading', 'Commercial invoice', 'Customs packet'],
    exception: 'No active exception. Vessel and arrival forecast are current.',
    milestones: [
      {
        title: 'Booking confirmed',
        detail: 'Shanghai, CN - 12 Mar',
        done: true,
      },
      {
        title: 'Departed',
        detail: 'Shanghai Yangshan Terminal - 15 Mar',
        done: true,
      },
      {
        title: 'In Transit - Pacific Ocean',
        detail: 'Vessel COEX HORIZON - Voy. 118E',
        done: true,
      },
      {
        title: 'Arrival Los Angeles',
        detail: 'Estimated 29 Mar',
        done: false,
      },
      {
        title: 'Customs cleared & delivered',
        detail: 'Pending',
        done: false,
      },
    ],
  },
  {
    number: 'LLX-8143-2290',
    status: 'LABEL READY',
    progress: 34,
    origin: 'Austin, TX',
    destination: 'Los Angeles, CA',
    mode: 'Parcel / checked luggage',
    eta: 'Sep 9',
    pieces: '2 checked bags',
    documents: ['Digital label', 'Carrier receipt', 'Protection certificate'],
    milestones: [
      {
        title: 'Quote reserved',
        detail: 'Austin, TX - Sep 2',
        done: true,
      },
      {
        title: 'Digital label ready',
        detail: 'Phone-ready label created',
        done: true,
      },
      {
        title: 'Carrier accepted',
        detail: 'Pending pickup or drop-off scan',
        done: false,
      },
      {
        title: 'In transit',
        detail: 'Pending',
        done: false,
      },
      {
        title: 'Delivered',
        detail: 'Pending',
        done: false,
      },
    ],
  },
];

const faqItems = [
  {
    key: 'work',
    label: 'How does COEX Shipping work?',
    children:
      'Choose the shipment type, share the lane and deadline, receive a benchmark quote, then book pickup, documents, tracking, and delivery milestones from one operating surface.',
  },
  {
    key: 'services',
    label: 'Which services are supported?',
    children:
      'The site supports ocean freight, air freight, road transportation, warehousing and distribution, customs and documentation, end-to-end logistics, luggage, boxes, envelopes, golf clubs, skis, and snowboards.',
  },
  {
    key: 'tracking',
    label: 'Can users track every milestone?',
    children:
      'Yes. The reference tracking flow shows booking confirmation, terminal departure, in-transit vessel details, estimated arrival, customs, and final delivery status.',
  },
  {
    key: 'docs',
    label: 'Are documents included?',
    children:
      'Bills of lading, invoices, customs documents, digital labels, receipts, and protection certificates are kept with the shipment record in the demo UI.',
  },
  {
    key: 'alerts',
    label: 'What happens when a shipment slips?',
    children:
      'The product surfaces exception alerts when a departure, transfer, clearance, or delivery milestone slips, then keeps the revised ETA visible.',
  },
  {
    key: 'contact',
    label: 'How can customers reach COEX?',
    children:
      'The Lovable reference lists +1 862-381-9018 and hello@coexshipping.com for customer contact.',
  },
];

function getQuoteMetrics(quote: QuoteState) {
  const packages = itemOrder.reduce((sum, key) => sum + quote.counts[key], 0);
  const billableWeight = itemOrder.reduce(
    (sum, key) => sum + quote.counts[key] * itemDefinitions[key].weight,
    0,
  );
  const itemSubtotal = itemOrder.reduce(
    (sum, key) => sum + quote.counts[key] * itemDefinitions[key].base,
    0,
  );
  const speed = speedDefinitions[quote.speed];
  const pickupFee = quote.pickup ? 26 + packages * 4 : 0;
  const protectionFee = quote.protection ? Math.max(15, packages * 9) : 0;
  const businessDiscount = quote.customerType === 'business' ? 0.9 : 1;
  const total = Math.max(
    packages ? 28 : 0,
    Math.round(
      (itemSubtotal * speed.multiplier + pickupFee + protectionFee) *
        businessDiscount,
    ),
  );
  const benchmark = Math.max(80, packages * 58 + Math.max(0, billableWeight - 50));
  const savings = Math.max(0, Math.round(benchmark - total));

  return {
    packages,
    billableWeight,
    total,
    pickupFee,
    protectionFee,
    savings,
    eta: speed.eta,
    service: speed.label,
  };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function createFallbackShipment(number: string): Shipment {
  return {
    number: number || 'COEX-GUEST-2048',
    status: 'LABEL CREATED',
    progress: 22,
    origin: 'Origin pending',
    destination: 'Destination pending',
    mode: 'Courier / freight',
    eta: 'Pending first scan',
    pieces: '1 shipment',
    documents: ['Digital label pending first carrier scan'],
    milestones: [
      {
        title: 'Quote reserved',
        detail: 'Shipment staged in the demo console',
        done: true,
      },
      {
        title: 'Label created',
        detail: 'Ready for pickup or drop-off',
        done: true,
      },
      {
        title: 'Carrier accepted',
        detail: 'Pending first scan',
        done: false,
      },
      {
        title: 'In transit',
        detail: 'Pending',
        done: false,
      },
      {
        title: 'Delivered',
        detail: 'Pending',
        done: false,
      },
    ],
  };
}

function useQuoteState() {
  return useState<QuoteState>(() => ({
    ...initialQuote,
    counts: { ...initialQuote.counts },
  }));
}

function useWebMcpTools({
  quote,
  setQuote,
  setShipment,
}: {
  quote: QuoteState;
  setQuote: React.Dispatch<React.SetStateAction<QuoteState>>;
  setShipment: React.Dispatch<React.SetStateAction<Shipment>>;
}) {
  useEffect(() => {
    const registerTool = document.modelContext?.registerTool;
    if (!registerTool) {
      return;
    }

    const lifecycle = new AbortController();
    const register = (tool: WebMcpTool) => {
      Promise.resolve(registerTool(tool, { signal: lifecycle.signal })).catch(
        () => undefined,
      );
    };

    register({
      name: 'calculate_quote',
      title: 'Calculate quote',
      description:
        'Stage a COEX Shipping quote using the visible quote calculator state.',
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      inputSchema: {
        type: 'object',
        properties: {
          origin: { type: 'string' },
          destination: { type: 'string' },
          speed: {
            type: 'string',
            enum: ['standard', 'nextDay', 'sameDay'],
          },
          protection: { type: 'boolean' },
          pickup: { type: 'boolean' },
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

        const nextQuote: QuoteState = {
          ...quote,
          counts,
          origin: typeof value.origin === 'string' ? value.origin : quote.origin,
          destination:
            typeof value.destination === 'string'
              ? value.destination
              : quote.destination,
          speed:
            value.speed === 'nextDay' || value.speed === 'sameDay'
              ? value.speed
              : value.speed === 'standard'
                ? 'standard'
                : quote.speed,
          protection:
            typeof value.protection === 'boolean'
              ? value.protection
              : quote.protection,
          pickup: typeof value.pickup === 'boolean' ? value.pickup : quote.pickup,
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
            packages: metrics.packages,
            billableWeight: metrics.billableWeight,
            eta: metrics.eta,
            service: metrics.service,
            savings: metrics.savings,
          },
        };
      },
    });

    register({
      name: 'track_shipment',
      title: 'Track shipment',
      description:
        'Look up a demo COEX shipment and update the visible tracking panel.',
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      inputSchema: {
        type: 'object',
        properties: {
          trackingNumber: { type: 'string' },
        },
        required: ['trackingNumber'],
        additionalProperties: false,
      },
      execute(input) {
        const value =
          typeof input === 'object' && input !== null
            ? (input as Record<string, unknown>)
            : {};
        if (typeof value.trackingNumber !== 'string' || !value.trackingNumber.trim()) {
          throw new Error('trackingNumber is required');
        }

        const requested = value.trackingNumber.trim().toUpperCase();
        const shipment =
          sampleShipments.find((item) => item.number === requested) ??
          createFallbackShipment(requested);
        setShipment(shipment);

        return {
          status: 'tracking_ready',
          shipment: {
            number: shipment.number,
            status: shipment.status,
            progress: shipment.progress,
            origin: shipment.origin,
            destination: shipment.destination,
            eta: shipment.eta,
          },
        };
      },
    });

    return () => lifecycle.abort();
  }, [quote, setQuote, setShipment]);
}

function ShippingFrame({
  active,
  children,
}: {
  active: PageKey;
  children: ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0f8f93',
          colorSuccess: '#18a058',
          colorWarning: '#e0a11a',
          colorInfo: '#2457c5',
          colorTextBase: '#152935',
          colorBgBase: '#f5fbfa',
          colorBorder: '#d7e5e3',
          borderRadius: 8,
          fontFamily:
            'var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif',
        },
        components: {
          Button: {
            controlHeight: 42,
            borderRadius: 8,
            fontWeight: 650,
          },
          Card: {
            borderRadiusLG: 8,
            paddingLG: 22,
          },
          Menu: {
            itemBorderRadius: 8,
          },
          Steps: {
            colorPrimary: '#0f8f93',
          },
        },
      }}
    >
      <Layout className="ship-app-shell">
        <Header className="ship-header">
          <Link className="ship-logo" href="/" aria-label="COEX Shipping home">
            <span className="ship-logo-mark">
              <GlobalOutlined />
            </span>
            <span>
              <strong>COEX Shipping</strong>
              <small>Connect Express</small>
            </span>
          </Link>
          <Menu
            className="ship-menu"
            mode="horizontal"
            selectedKeys={[active]}
            items={[
              { key: 'home', label: <Link href="/">Overview</Link> },
              { key: 'services', label: <Link href="/#services">Services</Link> },
              { key: 'quote', label: <Link href="/quote">Quote</Link> },
              { key: 'tracking', label: <Link href="/tracking">Tracking</Link> },
              { key: 'book', label: <Link href="/book">Book</Link> },
            ]}
          />
          <Space className="ship-header-actions" size={8}>
            <Button href="/login" icon={<UserOutlined />} className="ship-signin">
              Sign in
            </Button>
            <Button type="primary" href="/quote" icon={<ArrowRightOutlined />}>
              Get a Quote
            </Button>
          </Space>
        </Header>
        <Content>{children}</Content>
        <Footer className="ship-footer">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={9}>
              <Space align="start" size={12}>
                <span className="ship-footer-mark">
                  <GlobalOutlined />
                </span>
                <div>
                  <Title level={4}>COEX Shipping</Title>
                  <Paragraph>
                    Global freight forwarding across ocean, air and inland
                    logistics, redesigned as a premium quote-to-delivery platform.
                  </Paragraph>
                  <Space wrap>
                    <Tag icon={<PhoneOutlined />}>+1 862-381-9018</Tag>
                    <Tag icon={<MailOutlined />}>hello@coexshipping.com</Tag>
                  </Space>
                </div>
              </Space>
            </Col>
            {[
              ['Services', ['Ocean Freight', 'Air Freight', 'Road Transportation', 'Warehousing']],
              ['Solutions', ['Retail & E-commerce', 'Manufacturing', 'Healthcare', 'Energy Cargo']],
              ['Tools', ['Quote Calculator', 'Shipment Tracking', 'Booking Wizard', 'Guest Account']],
            ].map(([heading, links]) => (
              <Col xs={12} md={8} lg={5} key={heading as string}>
                <Title level={5}>{heading}</Title>
                <ul className="ship-footer-list">
                  {(links as string[]).map((link) => (
                    <li key={link}>{link}</li>
                  ))}
                </ul>
              </Col>
            ))}
          </Row>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

function MetricStrip() {
  return (
    <Row gutter={[12, 12]} className="ship-metrics">
      {coexMetrics.map(([value, label]) => (
        <Col xs={12} sm={6} key={label}>
          <Card className="metric-card">
            <Statistic value={value} title={label} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function HeroVisualCard() {
  return (
    <Card className="visual-card" styles={{ body: { padding: 0 } }}>
      <Image
        alt="Luggage, sports gear, boxes, labels and a phone prepared for shipment"
        className="hero-image"
        height={1024}
        priority
        src="/hero-logistics.png"
        width={1792}
      />
      <div className="visual-overlay">
        <Space align="center" className="visual-status">
          <Badge status="processing" />
          <Text strong>Live shipment command center</Text>
        </Space>
        <div className="route-line">
          <span>Shanghai</span>
          <i />
          <span>Los Angeles</span>
        </div>
        <Row gutter={8}>
          {[
            ['Mode', "Ocean - FCL 40'"],
            ['ETA', '29 Mar'],
            ['Status', 'In transit'],
          ].map(([label, value]) => (
            <Col span={8} key={label}>
              <div className="mini-stat">
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Card>
  );
}

function CompactQuoteCard({
  quote,
  setQuote,
}: {
  quote: QuoteState;
  setQuote: React.Dispatch<React.SetStateAction<QuoteState>>;
}) {
  const metrics = getQuoteMetrics(quote);

  return (
    <Card className="quote-card ant-card-premium">
      <Space orientation="vertical" size={18} className="full-width">
        <div className="section-kicker">Instant quote</div>
        <Title level={2}>Choose cargo. See the lane. Reserve the plan.</Title>
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
        <Row gutter={[10, 10]}>
          {(['checked', 'box', 'golf', 'ski'] as ItemKey[]).map((key) => {
            const item = itemDefinitions[key];
            const active = quote.counts[key] > 0;
            return (
              <Col span={12} key={key}>
                <button
                  className={`cargo-choice ${active ? 'active' : ''}`}
                  type="button"
                  onClick={() =>
                    setQuote((current) => ({
                      ...current,
                      counts: {
                        ...current.counts,
                        [key]: active ? 0 : 1,
                      },
                    }))
                  }
                >
                  <span>{item.icon}</span>
                  <strong>{item.label}</strong>
                  <small>{item.sublabel}</small>
                </button>
              </Col>
            );
          })}
        </Row>
        <Row gutter={[10, 10]}>
          <Col xs={24} md={12}>
            <Input
              aria-label="Pickup origin"
              prefix={<EnvironmentOutlined />}
              value={quote.origin}
              onChange={(event) =>
                setQuote((current) => ({ ...current, origin: event.target.value }))
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <Input
              aria-label="Destination"
              prefix={<EnvironmentOutlined />}
              value={quote.destination}
              onChange={(event) =>
                setQuote((current) => ({
                  ...current,
                  destination: event.target.value,
                }))
              }
            />
          </Col>
        </Row>
        <Radio.Group
          className="full-width service-radio"
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
            <Radio.Button key={key} value={key}>
              {speed.label}
            </Radio.Button>
          ))}
        </Radio.Group>
        <div className="estimate-panel">
          <Statistic title="Estimated total" value={metrics.total} prefix="$" />
          <Text type="secondary">
            {metrics.packages} pieces, {metrics.billableWeight} lb billable, ETA{' '}
            {metrics.eta}
          </Text>
          <Button type="primary" href="/quote" icon={<ArrowRightOutlined />}>
            Open full calculator
          </Button>
        </div>
      </Space>
    </Card>
  );
}

function updateCount(
  setQuote: React.Dispatch<React.SetStateAction<QuoteState>>,
  key: ItemKey,
  delta: number,
) {
  setQuote((quote) => ({
    ...quote,
    counts: {
      ...quote.counts,
      [key]: Math.max(0, Math.min(12, quote.counts[key] + delta)),
    },
  }));
}

function TrackingPanel({
  shipment,
  setShipment,
}: {
  shipment: Shipment;
  setShipment: React.Dispatch<React.SetStateAction<Shipment>>;
}) {
  const [trackingNumber, setTrackingNumber] = useState(shipment.number);

  function track(value?: string) {
    const requested = (value || trackingNumber).trim().toUpperCase();
    const next =
      sampleShipments.find((item) => item.number === requested) ??
      createFallbackShipment(requested);
    setTrackingNumber(requested);
    setShipment(next);
  }

  const timelineItems = shipment.milestones.map((item) => ({
    color: item.done ? '#0f8f93' : '#c4d5d2',
    icon: item.done ? <CheckCircleFilled /> : undefined,
    content: (
      <div>
        <Text strong>{item.title}</Text>
        <Paragraph className="timeline-detail">{item.detail}</Paragraph>
      </div>
    ),
  }));

  return (
    <Card className="tracking-card ant-card-premium">
      <Space orientation="vertical" size={18} className="full-width">
        <Input.Search
          aria-label="Tracking number"
          enterButton="Track shipment"
          prefix={<SearchOutlined />}
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          onSearch={track}
        />
        <div className="tracking-head">
          <div>
            <Tag color="cyan">{shipment.number}</Tag>
            <Title level={3}>
              {shipment.origin} <ArrowRightOutlined /> {shipment.destination}
            </Title>
            <Text type="secondary">
              {shipment.mode} - {shipment.pieces}
            </Text>
          </div>
          <Tag color={shipment.status.includes('TRANSIT') ? 'blue' : 'gold'}>
            {shipment.status}
          </Tag>
        </div>
        <Progress percent={shipment.progress} strokeColor="#0f8f93" />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Timeline items={timelineItems} />
          </Col>
          <Col xs={24} lg={10}>
            <Descriptions
              bordered
              column={1}
              size="small"
              items={[
                { key: 'eta', label: 'Estimated arrival', children: shipment.eta },
                { key: 'origin', label: 'Origin', children: shipment.origin },
                {
                  key: 'destination',
                  label: 'Destination',
                  children: shipment.destination,
                },
                { key: 'mode', label: 'Mode', children: shipment.mode },
              ]}
            />
            <Divider titlePlacement="left">Documents</Divider>
            <ul className="document-list">
              {shipment.documents.map((document) => (
                <li key={document}>
                  <Space>
                    <FileDoneOutlined className="primary-icon" />
                    {document}
                  </Space>
                </li>
              ))}
            </ul>
            {shipment.exception ? (
              <Alert
                className="tracking-alert"
                type="success"
                showIcon
                title={shipment.exception}
              />
            ) : null}
          </Col>
        </Row>
      </Space>
    </Card>
  );
}

export function HomePage() {
  const [quote, setQuote] = useQuoteState();
  const [shipment, setShipment] = useState<Shipment>(sampleShipments[0]);
  useWebMcpTools({ quote, setQuote, setShipment });

  return (
    <ShippingFrame active="home">
      <section className="hero-section">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} lg={12}>
            <Space orientation="vertical" size={22}>
              <Tag color="cyan" icon={<Badge status="processing" />}>
                Global logistics & freight forwarding
              </Tag>
              <div>
                <Title className="hero-title">Moving your business across the world.</Title>
                <Paragraph className="hero-subtitle">
                  COEX Shipping provides reliable ocean, air and inland logistics
                  with the visibility and control your supply chain demands.
                </Paragraph>
              </div>
              <Space wrap size={12}>
                <Button
                  type="primary"
                  size="large"
                  href="/quote"
                  icon={<DollarCircleOutlined />}
                >
                  Get a Quote
                </Button>
                <Button size="large" href="/tracking" icon={<SearchOutlined />}>
                  Track Shipment
                </Button>
              </Space>
              <MetricStrip />
            </Space>
          </Col>
          <Col xs={24} lg={12}>
            <CompactQuoteCard quote={quote} setQuote={setQuote} />
          </Col>
        </Row>
      </section>

      <section className="content-band">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={11}>
            <HeroVisualCard />
          </Col>
          <Col xs={24} lg={13}>
            <div className="section-kicker">Built for certainty</div>
            <Title level={2}>
              Rates you can plan against, documents that clear, milestones you
              can see before they become problems.
            </Title>
            <Paragraph>
              COEX was built by freight operators. The public reference centers
              on contracted capacity, trusted carriers, ports, warehouses, local
              partners, and one team accountable from booking to delivery.
            </Paragraph>
            <Row gutter={[12, 12]}>
              {[
                ['Reliable', 'Contracted capacity and disciplined milestone management.'],
                ['Transparent', 'Clear rates, documents, and destination line items.'],
                ['Technology-Driven', 'Quotes, bookings, documents, and tracking together.'],
                ['Customer-Focused', 'A named logistics team in your time zone.'],
              ].map(([title, text]) => (
                <Col xs={24} sm={12} key={title}>
                  <Card className="micro-card">
                    <Title level={5}>{title}</Title>
                    <Paragraph>{text}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </section>

      <section className="content-band alt" id="services">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Services</div>
            <Title level={2}>Logistics services built around your business.</Title>
            <Paragraph>
              Freight moves differently for every business. COEX combines mode,
              routing and documentation into a single operating plan.
            </Paragraph>
          </div>
          <Button href="/quote" type="primary" icon={<ArrowRightOutlined />}>
            Price a lane
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {coexServices.map((service) => (
            <Col xs={24} md={12} xl={8} key={service.title}>
              <Card className="service-card" hoverable>
                <div className="service-icon">{service.icon}</div>
                <Title level={4}>{service.title}</Title>
                <Paragraph>{service.text}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="content-band">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={10}>
            <div className="section-kicker">Global network</div>
            <Title level={2}>Global reach. Local expertise.</Title>
            <Paragraph>
              Connected through trusted carriers, ports, warehouses and local
              partners across Asia, Europe, North America, the Middle East and
              Africa.
            </Paragraph>
            <Space wrap>
              {['Asia', 'Europe', 'North America', 'Middle East', 'Africa'].map(
                (region) => (
                  <Tag key={region} color="cyan">
                    {region}
                  </Tag>
                ),
              )}
            </Space>
          </Col>
          <Col xs={24} lg={14}>
            <div className="network-map" aria-label="COEX Shipping network map">
              {['Asia', 'Europe', 'North America', 'Middle East', 'Africa'].map(
                (region, index) => (
                  <span className={`network-dot dot-${index}`} key={region}>
                    {region}
                  </span>
                ),
              )}
              <i className="network-route route-a" />
              <i className="network-route route-b" />
              <i className="network-route route-c" />
            </div>
          </Col>
        </Row>
      </section>

      <section className="content-band alt">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Process</div>
            <Title level={2}>A simple process, managed end to end.</Title>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          {processSteps.map(([step, title, text]) => (
            <Col xs={24} md={12} xl={6} key={step}>
              <Card className="process-card">
                <Text className="process-step">{step}</Text>
                <Title level={4}>{title}</Title>
                <Paragraph>{text}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="content-band" id="tracking">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={9}>
            <div className="section-kicker">Tracking</div>
            <Title level={2}>Know where your shipment stands.</Title>
            <Paragraph>
              Every COEX booking is visible in one place: confirmed milestones,
              vessel and flight details, documents, and estimated arrival.
            </Paragraph>
          </Col>
          <Col xs={24} lg={15}>
            <TrackingPanel shipment={shipment} setShipment={setShipment} />
          </Col>
        </Row>
      </section>

      <section className="content-band alt" id="solutions">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Industry solutions</div>
            <Title level={2}>Not generic freight. Built around how each industry operates.</Title>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          {coexSolutions.map((solution) => (
            <Col xs={24} md={12} xl={6} key={solution.title}>
              <Card className="solution-card" hoverable>
                <div className="service-icon">{solution.icon}</div>
                <Title level={4}>{solution.title}</Title>
                <Paragraph>{solution.text}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <FaqAndContact />
    </ShippingFrame>
  );
}

function FaqAndContact() {
  return (
    <section className="content-band" id="contact">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <div className="section-kicker">Contact</div>
          <Title level={2}>Ready to move your business forward?</Title>
          <Paragraph>
            Tell COEX what you are shipping, where it is going, and when you
            need it there.
          </Paragraph>
          <Space orientation="vertical" size={12}>
            <Button type="primary" size="large" href="/quote" icon={<DollarCircleOutlined />}>
              Get a Shipping Quote
            </Button>
            <Button size="large" href="tel:+18623819018" icon={<PhoneOutlined />}>
              Talk to Our Team
            </Button>
            <Button size="large" href="mailto:hello@coexshipping.com" icon={<MailOutlined />}>
              hello@coexshipping.com
            </Button>
          </Space>
        </Col>
        <Col xs={24} lg={14}>
          <Collapse
            className="faq-collapse"
            defaultActiveKey={['work']}
            items={faqItems}
          />
        </Col>
      </Row>
    </section>
  );
}

export function QuotePage() {
  const [quote, setQuote] = useQuoteState();
  const [, setShipment] = useState<Shipment>(sampleShipments[0]);
  const [saved, setSaved] = useState(false);
  const metrics = getQuoteMetrics(quote);
  useWebMcpTools({ quote, setQuote, setShipment });

  return (
    <ShippingFrame active="quote">
      <section className="page-hero">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={14}>
            <Tag color="cyan" icon={<DollarCircleOutlined />}>
              Shipping Quote Calculator
            </Tag>
            <Title>Request a shipping quote.</Title>
            <Paragraph>
              Choose what you are shipping, tell us where it goes, and the
              pricing engine returns a benchmarked door-to-door rate with no
              measuring guesswork.
            </Paragraph>
          </Col>
          <Col xs={24} lg={10}>
            <Card className="hero-summary">
              <Statistic title="Live estimate" value={metrics.total} prefix="$" />
              <Text type="secondary">
                {metrics.packages || 'No'} items selected - {metrics.eta}
              </Text>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="workspace-section">
        <Row gutter={[20, 20]} align="top">
          <Col xs={24} lg={15}>
            <Space orientation="vertical" size={18} className="full-width">
              <Card title="1. What are you shipping?" className="ant-card-premium">
                <Row gutter={[12, 12]}>
                  {itemOrder.map((key) => {
                    const item = itemDefinitions[key];
                    return (
                      <Col xs={24} md={12} key={key}>
                        <div className="item-row">
                          <Space>
                            <span className="item-icon">{item.icon}</span>
                            <span>
                              <Text strong>{item.label}</Text>
                              <Text type="secondary">{item.sublabel}</Text>
                              <small>{item.max}</small>
                            </span>
                          </Space>
                          <Space.Compact>
                            <Button
                              aria-label={`Remove one ${item.label}`}
                              icon={<MinusOutlined />}
                              onClick={() => updateCount(setQuote, key, -1)}
                            />
                            <InputNumber min={0} max={12} value={quote.counts[key]} readOnly />
                            <Button
                              aria-label={`Add one ${item.label}`}
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

              <Card title="2. Pickup location and destination" className="ant-card-premium">
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Pickup location">
                      <Input
                        prefix={<EnvironmentOutlined />}
                        value={quote.origin}
                        onChange={(event) =>
                          setQuote((current) => ({
                            ...current,
                            origin: event.target.value,
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Destination">
                      <Input
                        prefix={<EnvironmentOutlined />}
                        value={quote.destination}
                        onChange={(event) =>
                          setQuote((current) => ({
                            ...current,
                            destination: event.target.value,
                          }))
                        }
                      />
                    </Form.Item>
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
                          setQuote((current) => ({ ...current, pickupWindow }))
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
              </Card>

              <Card title="3. Schedule and service" className="ant-card-premium">
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
                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
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
                        Carrier pickup window at the origin address.
                      </Paragraph>
                    </Col>
                    <Col xs={24} md={12}>
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
                      <Paragraph className="check-help">
                        Coverage against loss or damage in transit.
                      </Paragraph>
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Space>
          </Col>

          <Col xs={24} lg={9}>
            <Card className="summary-card ant-card-premium">
              <div className="section-kicker">Shipment summary</div>
              <Statistic
                title="Estimated total"
                value={metrics.total}
                prefix="$"
                styles={{ content: { fontSize: 48 } }}
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
                    key: 'weight',
                    label: 'Billable weight',
                    children: `${metrics.billableWeight} lb`,
                  },
                  {
                    key: 'pickup',
                    label: 'Pickup',
                    children: quote.pickup
                      ? formatMoney(metrics.pickupFee)
                      : 'Drop-off selected',
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
                    label: 'Pickup date',
                    children: `${quote.pickupDate} / ${quote.pickupWindow}`,
                  },
                ]}
              />
              <Space orientation="vertical" className="full-width" size={12}>
                <Button
                  type="primary"
                  block
                  disabled={metrics.packages === 0}
                  onClick={() => setSaved(true)}
                  icon={<FileDoneOutlined />}
                >
                  Save estimate
                </Button>
                <Button block href="/book" icon={<ArrowRightOutlined />}>
                  Continue to booking
                </Button>
                {saved ? (
                  <Alert
                    type="success"
                    showIcon
                    title="Quote saved locally for this demo."
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
          Track a Shipment
        </Tag>
        <Title>Enter the tracking number from your booking confirmation.</Title>
        <Paragraph>
          See every milestone from pickup to final delivery. Try
          COEX-8143-2290 for the exact freight record from the Lovable reference
          or LLX-8143-2290 for a baggage shipment demo.
        </Paragraph>
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
          Book a courier pickup on COEX
        </Tag>
        <Title>Pickup, lane, cargo, confirmation.</Title>
        <Paragraph>
          A four-step booking workflow modeled from the Lovable reference and
          expanded with estimate, protection, and contact details.
        </Paragraph>
      </section>

      <section className="workspace-section">
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={8}>
            <Card className="ant-card-premium sticky-panel">
              <Steps current={step} orientation="vertical" items={stepItems} />
              <Divider />
              <Statistic title="Live estimate" value={metrics.total} prefix="$" />
              <Text type="secondary">
                {metrics.packages} items - {speedDefinitions[quote.speed].label}
              </Text>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card className="ant-card-premium">
              {confirmed ? (
                <Result
                  status="success"
                  title="Demo booking created"
                  subTitle="Confirmation COEX-DEMO-2609 is ready with digital label, documents, and tracking staged locally."
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
                    <Space orientation="vertical" className="full-width" size={16}>
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
                        description={`Pickup from ${booking.pickupAddress}, ${booking.pickupCity} to ${booking.destinationAddress}, ${booking.destinationCity}. Estimated ${formatMoney(metrics.total)} with ${metrics.service} service.`}
                      />
                    </Space>
                  ) : null}

                  <div className="wizard-actions">
                    <Button
                      disabled={step === 0}
                      onClick={() => setStep((current) => Math.max(0, current - 1))}
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
                      <Button type="primary" onClick={() => setConfirmed(true)}>
                        Create demo booking
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
              Sign in to CO-EX
            </Tag>
            <Title>Book pickups, manage your wallet, and track every parcel.</Title>
            <Paragraph>
              The account hub mirrors the Lovable reference sign-in flow:
              sign in, create account, forgot password, and continue as guest.
              This demo does not transmit credentials.
            </Paragraph>
            <Row gutter={[12, 12]}>
              {[
                ['Saved quotes', 4, <DollarCircleOutlined key="saved" />],
                ['Open shipments', 2, <TruckOutlined key="open" />],
                ['Documents', 9, <FileDoneOutlined key="docs" />],
              ].map(([title, value, icon]) => (
                <Col xs={24} sm={8} key={title as string}>
                  <Card className="metric-card">
                    <Statistic title={title as string} value={value as number} prefix={icon} />
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
                onClick={() => setMessage('Guest checkout enabled for this visit.')}
              >
                Continue as guest
              </Button>
              {message ? (
                <Alert className="login-alert" type="success" showIcon title={message} />
              ) : null}
            </Card>
          </Col>
        </Row>
      </section>
    </ShippingFrame>
  );
}

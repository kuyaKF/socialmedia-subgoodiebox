import crypto from 'node:crypto';
import { env } from '../config/env';

const PAYMONGO_API = 'https://api.paymongo.com/v1';

export class PayMongoError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function authHeader(): string {
  if (!env.paymongoSecretKey) {
    throw new Error('PAYMONGO_SECRET_KEY is not configured');
  }
  const token = Buffer.from(`${env.paymongoSecretKey}:`).toString('base64');
  return `Basic ${token}`;
}

export interface CheckoutSessionLineItem {
  amount: number;
  currency: string;
  name: string;
  quantity: number;
}

export interface CreateCheckoutSessionInput {
  lineItems: CheckoutSessionLineItem[];
  paymentMethodTypes: string[];
  successUrl: string;
  cancelUrl: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResource {
  id: string;
  attributes: {
    checkout_url: string;
    status: string;
    [key: string]: unknown;
  };
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CheckoutSessionResource> {
  const res = await fetch(`${PAYMONGO_API}/checkout_sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: input.lineItems.map((item) => ({
            amount: item.amount,
            currency: item.currency,
            name: item.name,
            quantity: item.quantity,
          })),
          payment_method_types: input.paymentMethodTypes,
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          description: input.description,
          send_email_receipt: false,
          show_line_items: true,
          metadata: input.metadata,
        },
      },
    }),
  });

  const json = (await res.json()) as {
    data?: CheckoutSessionResource;
    errors?: { detail?: string }[];
  };
  if (!res.ok) {
    const message = json?.errors?.[0]?.detail || `PayMongo request failed with status ${res.status}`;
    throw new PayMongoError(res.status, message);
  }
  return json.data as CheckoutSessionResource;
}

// --- Recurring billing (Subscriptions API) ---
//
// Used only by the opt-in auto-renew path (card/Maya) layered on top of the one-time Checkout
// Session flow above. Never accepts or forwards raw card fields — payment methods are tokenized
// client-side via PayMongo's public key and only a payment_method_id ever reaches this server,
// preserving the same zero-PCI-scope posture as the hosted Checkout Session flow.

interface PayMongoResource {
  id: string;
  attributes: Record<string, unknown>;
}

async function paymongoRequest<T extends PayMongoResource>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  attributes?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${PAYMONGO_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: attributes !== undefined ? JSON.stringify({ data: { attributes } }) : undefined,
  });

  const json = (await res.json()) as { data?: T; errors?: { detail?: string }[] };
  if (!res.ok) {
    const message = json?.errors?.[0]?.detail || `PayMongo request failed with status ${res.status}`;
    throw new PayMongoError(res.status, message);
  }
  return json.data as T;
}

export interface CreatePlanInput {
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'weekly' | 'monthly' | 'yearly';
  intervalCount: number;
  planType?: 'scheduled' | 'on_demand';
  cycleCount?: number;
  metadata?: Record<string, string>;
}

export async function createPlan(input: CreatePlanInput): Promise<PayMongoResource> {
  return paymongoRequest('POST', '/subscriptions/plans', {
    name: input.name,
    description: input.description,
    amount: input.amount,
    currency: input.currency,
    interval: input.interval,
    interval_count: input.intervalCount,
    plan_type: input.planType ?? 'scheduled',
    cycle_count: input.cycleCount,
    metadata: input.metadata,
  });
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  defaultDevice: 'phone' | 'email';
  phone?: string;
}

export async function createCustomer(input: CreateCustomerInput): Promise<PayMongoResource> {
  return paymongoRequest('POST', '/customers', {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    default_device: input.defaultDevice,
    phone: input.phone,
  });
}

export interface CreateSubscriptionInput {
  customerId: string;
  planId: string;
  metadata?: Record<string, string>;
}

// NOTE: whether the Subscriptions API accepts a payment_method_id directly here, or strictly
// relies on the customer's already-attached/default payment method, was not confirmed against a
// live sandbox response as of writing — verify before relying on this in the calling controller.
export async function createSubscription(input: CreateSubscriptionInput): Promise<PayMongoResource> {
  return paymongoRequest('POST', '/subscriptions', {
    customer_id: input.customerId,
    plan_id: input.planId,
    metadata: input.metadata,
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<PayMongoResource> {
  return paymongoRequest('POST', `/subscriptions/${subscriptionId}/cancel`);
}

export async function listCustomerPaymentMethods(customerId: string): Promise<PayMongoResource[]> {
  const res = await fetch(`${PAYMONGO_API}/customers/${customerId}/payment_methods`, {
    method: 'GET',
    headers: { Authorization: authHeader() },
  });
  const json = (await res.json()) as {
    data?: PayMongoResource[];
    errors?: { detail?: string }[];
  };
  if (!res.ok) {
    const message = json?.errors?.[0]?.detail || `PayMongo request failed with status ${res.status}`;
    throw new PayMongoError(res.status, message);
  }
  return json.data ?? [];
}

export async function deleteCustomerPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<void> {
  const res = await fetch(
    `${PAYMONGO_API}/customers/${customerId}/payment_methods/${paymentMethodId}`,
    { method: 'DELETE', headers: { Authorization: authHeader() } }
  );
  if (!res.ok) {
    const json = (await res.json()) as { errors?: { detail?: string }[] };
    const message = json?.errors?.[0]?.detail || `PayMongo request failed with status ${res.status}`;
    throw new PayMongoError(res.status, message);
  }
}

export interface PayMongoEvent {
  data: {
    id: string;
    type: string;
    attributes: {
      type: string;
      livemode: boolean;
      data: {
        id: string;
        type: string;
        attributes: Record<string, unknown>;
      };
    };
  };
}

// Verification algorithm matches PayMongo's official Node SDK exactly:
// header is "t=<timestamp>,te=<test_signature>,li=<live_signature>"; the signed string is
// `${timestamp}.${rawBody}`, HMAC-SHA256'd with the webhook secret.
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string | undefined
): PayMongoEvent {
  if (!secret) {
    throw new Error('Webhook secret is not configured');
  }

  const parts = signatureHeader.split(',');
  if (parts.length < 3) {
    throw new Error('Malformed Paymongo-Signature header');
  }

  const timestamp = parts[0].split('=')[1];
  const testModeSignature = parts[1].split('=')[1];
  const liveModeSignature = parts[2].split('=')[1];
  const comparisonSignature = liveModeSignature || testModeSignature;

  if (!timestamp || !comparisonSignature) {
    throw new Error('Malformed Paymongo-Signature header');
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(comparisonSignature);
  const isValid =
    expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);

  if (!isValid) {
    throw new Error('Webhook signature verification failed');
  }

  return JSON.parse(rawBody) as PayMongoEvent;
}

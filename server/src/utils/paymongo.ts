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
export function verifyWebhookSignature(rawBody: string, signatureHeader: string): PayMongoEvent {
  if (!env.paymongoWebhookSecret) {
    throw new Error('PAYMONGO_WEBHOOK_SECRET is not configured');
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
    .createHmac('sha256', env.paymongoWebhookSecret)
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

<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Vodafone Cash Manual Payment Plugin
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a> |
  <a href="https://github.com/M-Nasser-M/vodafonecash-manual-payment-plugin">GitHub</a>
</h4>

<p align="center">
  <strong>A Medusa.js manual payment provider plugin for Vodafone Cash that requires manual verification of payments</strong>
</p>

## Overview

This plugin provides a **manual payment provider** for Vodafone Cash, a popular mobile payment service in Egypt and other African countries. **Important:** This plugin requires manual verification by administrators for all payments. The plugin includes:

- **Phone Number Validation**: Ensures phone numbers start with `010` and are exactly 11 digits
- **Persistent Payment Requests**: Payment requests are stored in a dedicated `paymentRequest` module (with migrations)
- **Manual Payment Processing**: Allows customers to receive payment instructions and admins to verify payments manually
- **Workflow-Driven Mutations**: All state changes run through Medusa workflows with rollback
- **Protected Admin API**: Admin endpoints require user authentication
- **Admin Interface**: Provides endpoints for payment verification and status management
- **Store Interface**: Handles payment initiation with proper validation

## Features

- ✅ **Manual Verification Required**: All payments must be manually verified by administrators
- ✅ **Strict Phone Validation**: Only accepts Vodafone Cash numbers (010XXXXXXXX format)
- ✅ **Persistent Storage**: Payment requests persisted in the database via a custom module
- ✅ **Payment Instructions**: Provides clear step-by-step payment instructions to customers
- ✅ **Admin Management Interface**: Authenticated admin endpoints for payment verification and status management
- ✅ **Error Handling**: Medusa-standard error responses with actionable messages
- ✅ **TypeScript Support**: Fully typed implementation following Medusa best practices

## Compatibility

This plugin is compatible with Medusa v2.18.0 and above, and requires Node.js 20 or higher.

## Installation

1. Install the plugin in your Medusa project:
```bash
npm install @m-nasser-m/medusa-payment-vodafone-cash-manual
# or
yarn add @m-nasser-m/medusa-payment-vodafone-cash-manual
```

2. Add the plugin to your `medusa-config.js`:
```javascript
module.exports = {
  plugins: [
    {
      resolve: "@m-nasser-m/medusa-payment-vodafone-cash-manual",
      options: {
        debug: false // Optional: enable debug logging
      }
    }
  ],
  modules: {
    paymentProviders: {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@m-nasser-m/medusa-payment-vodafone-cash-manual/providers/vodafone-cash",
            id: "vodafone-cash-manual",
            options: {
              debug: false
            }
          }
        ]
      }
    }
  }
}
```

## Usage

### Customer Payment Flow

1. **Payment Initiation**: Customer selects Vodafone Cash at checkout
2. **Phone Number Entry**: Customer provides their Vodafone Cash number (must start with 010)
3. **Payment Instructions**: Customer receives detailed payment instructions
4. **Manual Payment**: Customer completes payment via Vodafone Cash app or USSD
5. **Order Pending**: Order remains pending until admin verification

### Admin Verification Flow

1. **Payment Review**: Admin reviews pending Vodafone Cash payments
2. **Verification**: Admin verifies payment receipt and updates status
3. **Order Completion**: Verified payments trigger order completion

## API Endpoints

### Store API

#### GET `/store/plugin`
Get plugin information and supported formats.

**Response:**
```json
{
  "message": "Vodafone Cash Payment Provider",
  "provider_id": "vodafone-cash-manual",
  "supported_currencies": ["EGP"],
  "phone_format": "010XXXXXXXX (11 digits starting with 010)"
}
```

#### POST `/store/plugin`
Initiate a Vodafone Cash payment.

**Request Body:**
```json
{
  "phone_number": "01001234567",
  "customer_name": "John Doe",
  "amount": 1000,
  "currency_code": "EGP"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payreq_01J3XYZABC1234567890",
    "provider_id": "vodafone-cash-manual",
    "amount": 1000,
    "currency_code": "EGP",
    "phone_number": "0100 123 4567",
    "customer_name": "John Doe",
    "status": "pending",
    "created_at": "2026-08-08T12:00:00.000Z",
    "payment_instructions": {
      "message": "Please send 1000 EGP via Vodafone Cash",
      "phone_number": "0100 123 4567",
      "steps": [
        "Open your Vodafone Cash app or dial *9*",
        "Send 1000 EGP to the merchant",
        "Keep your transaction reference number",
        "Your order will be confirmed once payment is verified"
      ]
    }
  }
}
```

**Errors (400):**
```json
{
  "type": "invalid_data",
  "message": "Invalid request: Phone number must start with 010 and be exactly 11 digits"
}
```

### Admin API

All admin endpoints require authentication (`Authorization: Bearer <token>` or session cookie).

#### GET `/admin/plugin`
List payment requests.

**Query Parameters:**
- `status`: Filter by payment status (`pending`, `verified`, `failed`, `refunded`, `canceled`)
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payreq_01J3XYZABC1234567890",
      "provider_id": "vodafone-cash-manual",
      "amount": 1000,
      "currency_code": "EGP",
      "phone_number": "01001234567",
      "customer_name": "John Doe",
      "status": "pending",
      "transaction_reference": null,
      "admin_notes": null,
      "created_at": "2026-08-08T12:00:00.000Z"
    }
  ],
  "count": 1,
  "offset": 0,
  "limit": 50
}
```

#### POST `/admin/plugin`
Verify a Vodafone Cash payment. Sets the payment to `verified` (or `failed` when `verified` is false).

**Request Body:**
```json
{
  "payment_id": "payreq_01J3XYZABC1234567890",
  "transaction_reference": "VF123456789",
  "verified": true,
  "admin_notes": "Payment verified via Vodafone Cash statement"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified",
  "data": {
    "id": "payreq_01J3XYZABC1234567890",
    "provider_id": "vodafone-cash-manual",
    "amount": 1000,
    "currency_code": "EGP",
    "phone_number": "01001234567",
    "customer_name": "John Doe",
    "status": "verified",
    "transaction_reference": "VF123456789",
    "admin_notes": "Payment verified via Vodafone Cash statement",
    "created_at": "2026-08-08T12:00:00.000Z"
  }
}
```

#### POST `/admin/plugin/update-status`
Update payment status. Status transitions are validated: `pending` → `verified`/`failed`/`canceled`, `verified` → `refunded`.

**Request Body:**
```json
{
  "payment_id": "payreq_01J3XYZABC1234567890",
  "status": "verified",
  "admin_notes": "Payment confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated to verified",
  "data": {
    "id": "payreq_01J3XYZABC1234567890",
    "provider_id": "vodafone-cash-manual",
    "amount": 1000,
    "currency_code": "EGP",
    "phone_number": "01001234567",
    "customer_name": "John Doe",
    "status": "verified",
    "transaction_reference": null,
    "admin_notes": "Payment confirmed",
    "created_at": "2026-08-08T12:00:00.000Z"
  }
}
```

## Phone Number Validation

The plugin enforces strict validation for Vodafone Cash phone numbers:

- **Format**: Must start with `010`
- **Length**: Exactly 11 digits
- **Pattern**: `010XXXXXXXX` where X is any digit (0-9)

**Valid Examples:**
- `01001234567`
- `01011234567`
- `0102 345 6789` (spaces are automatically removed)

**Invalid Examples:**
- `01101234567` (doesn't start with 010)
- `010123456` (too short)
- `010123456789` (too long)
- `010abcd5678` (contains non-digits)

## Error Handling

The plugin uses Medusa's standard error format:

### Validation Errors (400)
Returned by `validateAndTransformBody`/`validateAndTransformQuery` middleware:
```json
{
  "type": "invalid_data",
  "message": "Invalid request: Phone number must start with 010 and be exactly 11 digits"
}
```

### Invalid Status Transition (400)
Returned by the update-status workflow step:
```json
{
  "type": "invalid_data",
  "message": "Cannot transition payment request verified -> pending"
}
```

### Authentication Errors (401)
Returned by the `authenticate` middleware on admin routes without valid credentials:
```json
{
  "type": "unauthorized",
  "message": "Unauthorized"
}
```

## Development

### Building the Plugin
```bash
npm run build
# or
yarn build
```

### Linting
```bash
npm run lint
```

### Migrations

The plugin's `paymentRequest` module ships its own migration. To generate a new migration after changing a data model:

```bash
npx medusa plugin:db:generate
```

Migrations are applied by the consuming Medusa application with `npx medusa db:migrate`.

### Development Mode
```bash
npm run dev
# or
yarn dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)

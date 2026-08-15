import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260808020541 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "payment_request" ("id" text not null, "provider_id" text not null, "amount" numeric not null, "currency_code" text not null, "phone_number" text not null, "customer_name" text null, "status" text check ("status" in ('pending', 'verified', 'failed', 'refunded', 'canceled')) not null default 'pending', "transaction_reference" text null, "admin_notes" text null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_request_deleted_at" ON "payment_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "payment_request" cascade;`);
  }

}

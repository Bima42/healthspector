CREATE TYPE "public"."pain_type" AS ENUM('sharp', 'dull', 'burning', 'tingling', 'throbbing', 'cramping', 'shooting', 'other');--> statement-breakpoint
ALTER TABLE "pain_points" ADD COLUMN "type" "pain_type" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "pain_points" ADD COLUMN "rating" integer DEFAULT 5 NOT NULL;
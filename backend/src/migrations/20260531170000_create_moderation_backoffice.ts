import type { Knex } from "knex";

const jsonArray = (knex: Knex) => knex.raw("'[]'::jsonb");
const jsonObject = (knex: Knex) => knex.raw("'{}'::jsonb");

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("moderation_reports", (t) => {
    t.bigIncrements("id").primary();
    t.string("subject", 180).notNullable();
    t.string("target_type", 40).notNullable();
    t.string("target_name", 160).notNullable();
    t.string("reporter_name", 160).notNullable();
    t.string("reason", 120).notNullable();
    t.text("summary").notNullable();
    t.string("severity", 16).notNullable().defaultTo("medium");
    t.string("status", 24).notNullable().defaultTo("new");
    t.string("assigned_to", 160).nullable();
    t.jsonb("evidence").notNullable().defaultTo(jsonArray(knex));
    t.jsonb("internal_notes").notNullable().defaultTo(jsonArray(knex));
    t.jsonb("replies").notNullable().defaultTo(jsonArray(knex));
    t.jsonb("attachments").notNullable().defaultTo(jsonArray(knex));
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    t.index(["status", "severity"], "moderation_reports_status_severity_idx");
    t.index(["target_type"], "moderation_reports_target_type_idx");
    t.index(["updated_at"], "moderation_reports_updated_at_idx");
  });

  await knex.schema.createTable("moderation_content_items", (t) => {
    t.bigIncrements("id").primary();
    t.string("type", 32).notNullable();
    t.string("title", 180).notNullable();
    t.string("author_name", 160).notNullable();
    t.string("category", 80).notNullable();
    t.text("preview").notNullable();
    t.string("status", 24).notNullable().defaultTo("visible");
    t.string("severity", 16).notNullable().defaultTo("low");
    t.string("origin", 32).notNullable().defaultTo("community");
    t.jsonb("tags").notNullable().defaultTo(jsonArray(knex));
    t.integer("flag_count").unsigned().notNullable().defaultTo(0);
    t.integer("reports_count").unsigned().notNullable().defaultTo(0);
    t.text("moderation_note").notNullable().defaultTo("");
    t.bigInteger("map_id").nullable();
    t.string("map_title", 180).nullable();
    t.timestamp("last_action_at").nullable();
    t.string("last_action_by", 160).nullable();
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    t.index(["status", "severity"], "moderation_content_status_severity_idx");
    t.index(["type"], "moderation_content_type_idx");
    t.index(["updated_at"], "moderation_content_updated_at_idx");
  });

  await knex.schema.createTable("moderation_sanctions", (t) => {
    t.bigIncrements("id").primary();
    t.string("target_name", 160).notNullable();
    t.string("target_email", 180).nullable();
    t.string("type", 32).notNullable();
    t.string("scope", 32).notNullable();
    t.string("status", 24).notNullable().defaultTo("draft");
    t.string("severity", 16).notNullable().defaultTo("medium");
    t.string("reason", 160).notNullable();
    t.text("summary").notNullable();
    t.string("policy_label", 180).notNullable();
    t.string("created_by", 160).notNullable();
    t.string("assigned_to", 160).nullable();
    t.text("note").notNullable().defaultTo("");
    t.jsonb("evidence").notNullable().defaultTo(jsonArray(knex));
    t.jsonb("related_report_ids").notNullable().defaultTo(jsonArray(knex));
    t.jsonb("activity").notNullable().defaultTo(jsonArray(knex));
    t.integer("appeal_count").unsigned().notNullable().defaultTo(0);
    t.timestamp("start_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("end_at").nullable();
    t.timestamp("last_updated_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    t.index(["status", "type"], "moderation_sanctions_status_type_idx");
    t.index(["scope"], "moderation_sanctions_scope_idx");
    t.index(["end_at"], "moderation_sanctions_end_at_idx");
  });

  await knex.schema.createTable("moderation_appeals", (t) => {
    t.string("id", 40).primary();
    t.bigInteger("sanction_id").nullable().references("id").inTable("moderation_sanctions").onDelete("SET NULL");
    t.string("target_name", 160).notNullable();
    t.string("sanction_type", 32).notNullable();
    t.string("status", 24).notNullable().defaultTo("pending");
    t.text("message").notNullable();
    t.text("decision_note").nullable();
    t.timestamp("submitted_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    t.index(["status", "sanction_type"], "moderation_appeals_status_type_idx");
    t.index(["submitted_at"], "moderation_appeals_submitted_at_idx");
  });

  await knex.schema.createTable("moderation_audit_logs", (t) => {
    t.string("id", 48).primary();
    t.string("action_key", 80).notNullable();
    t.string("actor_name", 160).notNullable();
    t.string("resource_type", 32).notNullable();
    t.string("resource_label", 180).notNullable();
    t.jsonb("metadata").notNullable().defaultTo(jsonArray(knex));
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    t.index(["resource_type", "created_at"], "moderation_audit_resource_created_idx");
    t.index(["action_key"], "moderation_audit_action_key_idx");
  });

  await knex.schema.createTable("backoffice_matchmaking_modes", (t) => {
    t.increments("id").primary();
    t.string("key", 24).notNullable().unique();
    t.boolean("enabled").notNullable().defaultTo(true);
    t.integer("max_wait_time_sec").unsigned().notNullable().defaultTo(120);
    t.integer("mmr_window").unsigned().notNullable().defaultTo(300);
    t.integer("team_size").unsigned().notNullable().defaultTo(5);
    t.integer("players_in_queue").unsigned().notNullable().defaultTo(0);
    t.integer("matches_last_hour").unsigned().notNullable().defaultTo(0);
    t.timestamp("last_updated_at").notNullable().defaultTo(knex.fn.now());
    t.string("last_updated_by", 160).notNullable().defaultTo("system");
    t.timestamps(true, true);
  });

  await knex.schema.createTable("backoffice_matchmaking_audit", (t) => {
    t.increments("id").primary();
    t.string("mode_key", 24).notNullable();
    t.string("actor", 160).notNullable();
    t.jsonb("changes").notNullable().defaultTo(jsonArray(knex));
    t.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());

    t.index(["mode_key", "timestamp"], "backoffice_matchmaking_audit_mode_time_idx");
  });

  await knex.schema.createTable("backoffice_dashboard_snapshots", (t) => {
    t.string("period", 8).primary();
    t.integer("active_users").unsigned().notNullable().defaultTo(0);
    t.integer("matches_per_day").unsigned().notNullable().defaultTo(0);
    t.integer("transactions_per_day").unsigned().notNullable().defaultTo(0);
    t.integer("maps_published").unsigned().notNullable().defaultTo(0);
    t.integer("virtual_revenue").unsigned().notNullable().defaultTo(0);
    t.integer("pending_reports").unsigned().notNullable().defaultTo(0);
    t.jsonb("trends").notNullable().defaultTo(jsonObject(knex));
    t.timestamps(true, true);
  });

  await knex.schema.createTable("backoffice_rank_distribution", (t) => {
    t.increments("id").primary();
    t.string("period", 8).notNullable();
    t.string("rank_key", 24).notNullable();
    t.integer("count").unsigned().notNullable().defaultTo(0);
    t.unique(["period", "rank_key"]);
  });

  await knex.schema.createTable("backoffice_top_maps", (t) => {
    t.increments("id").primary();
    t.string("title", 180).notNullable();
    t.string("author", 160).notNullable();
    t.integer("tests").unsigned().notNullable().defaultTo(0);
    t.decimal("rating", 3, 1).notNullable().defaultTo(0);
    t.integer("position").unsigned().notNullable().defaultTo(0);
  });

  await knex.schema.createTable("backoffice_top_creators", (t) => {
    t.increments("id").primary();
    t.string("name", 160).notNullable();
    t.integer("maps_published").unsigned().notNullable().defaultTo(0);
    t.integer("total_tests").unsigned().notNullable().defaultTo(0);
    t.integer("position").unsigned().notNullable().defaultTo(0);
  });

  await knex.schema.createTable("backoffice_activity_events", (t) => {
    t.increments("id").primary();
    t.string("type", 32).notNullable();
    t.string("actor", 160).notNullable();
    t.string("target", 180).nullable();
    t.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());

    t.index(["timestamp"], "backoffice_activity_events_timestamp_idx");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("backoffice_activity_events");
  await knex.schema.dropTableIfExists("backoffice_top_creators");
  await knex.schema.dropTableIfExists("backoffice_top_maps");
  await knex.schema.dropTableIfExists("backoffice_rank_distribution");
  await knex.schema.dropTableIfExists("backoffice_dashboard_snapshots");
  await knex.schema.dropTableIfExists("backoffice_matchmaking_audit");
  await knex.schema.dropTableIfExists("backoffice_matchmaking_modes");
  await knex.schema.dropTableIfExists("moderation_audit_logs");
  await knex.schema.dropTableIfExists("moderation_appeals");
  await knex.schema.dropTableIfExists("moderation_sanctions");
  await knex.schema.dropTableIfExists("moderation_content_items");
  await knex.schema.dropTableIfExists("moderation_reports");
}

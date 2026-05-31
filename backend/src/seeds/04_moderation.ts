import type { Knex } from "knex";

function iso(value: string) {
  return new Date(value).toISOString();
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function json(value: unknown) {
  return JSON.stringify(value);
}

export async function seed(knex: Knex): Promise<void> {
  await knex("backoffice_activity_events").del();
  await knex("backoffice_top_creators").del();
  await knex("backoffice_top_maps").del();
  await knex("backoffice_rank_distribution").del();
  await knex("backoffice_dashboard_snapshots").del();
  await knex("backoffice_matchmaking_audit").del();
  await knex("backoffice_matchmaking_modes").del();
  await knex("moderation_audit_logs").del();
  await knex("moderation_appeals").del();
  await knex("moderation_sanctions").del();
  await knex("moderation_content_items").del();
  await knex("moderation_reports").del();

  await knex("moderation_reports").del();

  await knex("users")
    .insert([
      { pocketbase_user_id: "pb_001", username: "enzo", email: "enzo@gamedash.test", role: "admin", status: 1, region: "Île-de-France", bio: "Admin principal", language: "fr", matchmaking_pref: null, created_at: iso("2026-03-01T10:00:00"), updated_at: iso("2026-04-06T11:15:00"), deleted_at: null },
      { pocketbase_user_id: "pb_002", username: "alice", email: "alice@gamedash.test", role: "moderator", status: 1, region: "Lyon", bio: "Modération communauté", language: "fr", matchmaking_pref: null, created_at: iso("2026-03-02T14:00:00"), updated_at: iso("2026-04-06T09:40:00"), deleted_at: null },
      { pocketbase_user_id: "pb_003", username: "neo_runner", email: "neo.runner@gamedash.test", role: "player", status: 2, region: "Marseille", bio: null, language: "en", matchmaking_pref: null, created_at: iso("2026-03-04T09:30:00"), updated_at: iso("2026-04-05T18:20:00"), deleted_at: null },
      { pocketbase_user_id: "pb_004", username: "shadowfox", email: "shadowfox@gamedash.test", role: "player", status: 3, region: "Lille", bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-05T16:45:00"), updated_at: iso("2026-04-06T07:00:00"), deleted_at: null },
      { pocketbase_user_id: "pb_005", username: "luna", email: "luna@gamedash.test", role: "player", status: 1, region: "Bordeaux", bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-06T11:10:00"), updated_at: iso("2026-04-05T13:20:00"), deleted_at: null },
      { pocketbase_user_id: "pb_006", username: "raven", email: "raven@gamedash.test", role: "player", status: 2, region: "Nantes", bio: null, language: "en", matchmaking_pref: null, created_at: iso("2026-03-07T08:25:00"), updated_at: iso("2026-04-04T20:40:00"), deleted_at: null },
      { pocketbase_user_id: "pb_007", username: "orion", email: "orion@gamedash.test", role: "player", status: 1, region: "Toulouse", bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-08T13:00:00"), updated_at: iso("2026-04-06T10:05:00"), deleted_at: null },
      { pocketbase_user_id: "pb_008", username: "nova", email: "nova@gamedash.test", role: "moderator", status: 2, region: "Nice", bio: null, language: "en", matchmaking_pref: null, created_at: iso("2026-03-09T17:20:00"), updated_at: iso("2026-04-02T16:10:00"), deleted_at: null },
      { pocketbase_user_id: "pb_009", username: "milo", email: "milo@gamedash.test", role: "player", status: 1, region: "Dijon", bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-10T12:05:00"), updated_at: iso("2026-04-03T14:10:00"), deleted_at: null },
      { pocketbase_user_id: "pb_010", username: "pixelqueen", email: "pixelqueen@gamedash.test", role: "player", status: 1, region: "Strasbourg", bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-11T18:30:00"), updated_at: iso("2026-04-06T08:55:00"), deleted_at: null },
      { pocketbase_user_id: "pb_011", username: "thorium", email: "thorium@gamedash.test", role: "player", status: 3, region: "Rennes", bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-12T07:10:00"), updated_at: iso("2026-04-05T17:45:00"), deleted_at: null },
      { pocketbase_user_id: "pb_012", username: "mira", email: "mira@gamedash.test", role: "player", status: 1, region: "Montpellier", bio: null, language: "en", matchmaking_pref: null, created_at: iso("2026-03-13T10:45:00"), updated_at: iso("2026-04-06T06:25:00"), deleted_at: null },
      { pocketbase_user_id: "pb_013", username: "helios", email: "helios@gamedash.test", role: "moderator", status: 1, region: "Grenoble", bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-14T12:00:00"), updated_at: iso("2026-04-04T19:00:00"), deleted_at: null },
      { pocketbase_user_id: "pb_014", username: "ivy", email: "ivy@gamedash.test", role: "player", status: 2, region: null, bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-15T09:40:00"), updated_at: iso("2026-04-03T21:00:00"), deleted_at: null },
      { pocketbase_user_id: "pb_015", username: "zenit", email: "zenit@gamedash.test", role: "player", status: 0, region: "Paris", bio: null, language: "en", matchmaking_pref: null, created_at: iso("2026-03-16T15:15:00"), updated_at: iso("2026-04-02T10:25:00"), deleted_at: iso("2026-04-02T10:25:00") },
      { pocketbase_user_id: "pb_016", username: "ember", email: "ember@gamedash.test", role: "admin", status: 2, region: "Bruxelles", bio: null, language: "fr", matchmaking_pref: null, created_at: iso("2026-03-17T11:20:00"), updated_at: iso("2026-04-06T05:45:00"), deleted_at: null },
    ])
    .onConflict("pocketbase_user_id")
    .merge(["username", "email", "role", "status", "region", "bio", "language", "matchmaking_pref", "updated_at", "deleted_at"]);

  await knex.raw("SELECT setval(pg_get_serial_sequence('users','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM users), 1))");

  await knex("moderation_reports").insert([
    {
      id: 1,
      subject: "Insulte répétée dans le chat",
      target_type: "user",
      target_name: "shadowfox",
      reporter_name: "luna",
      reason: "Harcèlement",
      summary: "Le joueur est signalé pour plusieurs messages agressifs pendant une partie classée.",
      severity: "high",
      status: "new",
      assigned_to: null,
      evidence: json([{ id: "ev-1", label: "Messages signalés", value: "7" }, { id: "ev-2", label: "Partie", value: "Ranked 5v5 #9842" }]),
      internal_notes: json([]),
      replies: json([]),
      attachments: json([{ id: "att-1", name: "chat-log.png", type: "image", url: "https://picsum.photos/seed/report-chat/640/360", addedBy: "luna", addedAt: iso("2026-04-06T08:40:00"), description: "Capture du chat" }]),
      created_at: iso("2026-04-06T08:30:00"),
      updated_at: iso("2026-04-06T08:30:00"),
    },
    {
      id: 2,
      subject: "Carte avec élément offensant",
      target_type: "map",
      target_name: "Forgotten Outpost",
      reporter_name: "neo_runner",
      reason: "Contenu inapproprié",
      summary: "Une zone de la carte contient un symbole signalé par plusieurs joueurs.",
      severity: "critical",
      status: "investigating",
      assigned_to: "alice",
      evidence: json([{ id: "ev-3", label: "Signalements", value: "5" }, { id: "ev-4", label: "Version", value: "v2" }]),
      internal_notes: json([{ id: "note-1", author: "alice", message: "À vérifier dans l’éditeur de map avant sanction.", createdAt: iso("2026-04-06T09:10:00") }]),
      replies: json([{ id: "reply-1", author: "alice", message: "Merci, nous analysons le contenu signalé.", createdAt: iso("2026-04-06T09:15:00") }]),
      attachments: json([]),
      created_at: iso("2026-04-05T21:12:00"),
      updated_at: iso("2026-04-06T09:15:00"),
    },
    {
      id: 3,
      subject: "Spam de commentaires",
      target_type: "comment",
      target_name: "Commentaire #441",
      reporter_name: "mira",
      reason: "Spam",
      summary: "Commentaire dupliqué sous plusieurs maps publiques.",
      severity: "medium",
      status: "resolved",
      assigned_to: "enzo",
      evidence: json([{ id: "ev-5", label: "Occurrences", value: "12" }]),
      internal_notes: json([{ id: "note-2", author: "enzo", message: "Commentaire retiré et avertissement envoyé.", createdAt: iso("2026-04-04T16:10:00") }]),
      replies: json([]),
      attachments: json([]),
      created_at: iso("2026-04-04T15:20:00"),
      updated_at: iso("2026-04-04T16:10:00"),
    },
  ]);

  await knex("moderation_content_items").insert([
    { id: 1, type: "map", title: "Forgotten Outpost", author_name: "shadowfox", category: "Carte communautaire", preview: "Carte signalée pour un élément visuel ambigu.", status: "review", severity: "critical", origin: "community", tags: json(["map", "ugc", "report"]), flag_count: 5, reports_count: 5, moderation_note: "Vérifier la zone centrale de la map.", map_id: 2, map_title: "Forgotten Outpost", last_action_at: iso("2026-04-06T09:15:00"), last_action_by: "alice", created_at: iso("2026-04-02T10:00:00"), updated_at: iso("2026-04-06T09:15:00") },
    { id: 2, type: "comment", title: "Commentaire sous une carte #15", author_name: "thorium", category: "Commentaire", preview: "Message agressif et répété sous plusieurs créations.", status: "hidden", severity: "high", origin: "automated", tags: json(["comment", "spam", "toxicity"]), flag_count: 8, reports_count: 3, moderation_note: "Masqué automatiquement après seuil de toxicité.", map_id: 15, map_title: "Map #15", last_action_at: iso("2026-04-05T17:45:00"), last_action_by: "system", created_at: iso("2026-04-05T17:30:00"), updated_at: iso("2026-04-05T17:45:00") },
    { id: 3, type: "asset", title: "Avatar personnalisé #301", author_name: "luna", category: "Avatar", preview: "Avatar en attente de validation après signalement utilisateur.", status: "visible", severity: "low", origin: "community", tags: json(["avatar", "profile"]), flag_count: 1, reports_count: 1, moderation_note: "Aucun problème confirmé.", map_id: null, map_title: null, last_action_at: null, last_action_by: null, created_at: iso("2026-04-01T14:10:00"), updated_at: iso("2026-04-03T11:20:00") },
    { id: 4, type: "hunt", title: "Chasse Neon Trial", author_name: "pixelqueen", category: "Événement", preview: "Chasse publiée avec règles à relire côté modération.", status: "restricted", severity: "medium", origin: "internal", tags: json(["hunt", "event"]), flag_count: 2, reports_count: 0, moderation_note: "Restreinte le temps de compléter les règles.", map_id: 1, map_title: "Neon Crucible", last_action_at: iso("2026-04-04T08:20:00"), last_action_by: "enzo", created_at: iso("2026-03-28T16:00:00"), updated_at: iso("2026-04-04T08:20:00") },
  ]);

  await knex("moderation_sanctions").insert([
    { id: 1, target_name: "shadowfox", target_email: "shadowfox@gamedash.test", type: "temporaryBan", scope: "account", status: "draft", severity: "high", reason: "Harcèlement", summary: "Bannissement temporaire proposé suite à insultes répétées.", policy_label: "Code de conduite - respect des joueurs", created_by: "alice", assigned_to: "alice", note: "Attendre la vérification du chat complet avant activation.", evidence: json([{ id: "sev-1", label: "Reports liés", value: "#1" }, { id: "sev-2", label: "Messages", value: "7" }]), related_report_ids: json([1]), activity: json([{ id: "sa-1", actor: "alice", message: "Sanction préparée", createdAt: iso("2026-04-06T09:20:00") }]), appeal_count: 0, start_at: iso("2026-04-06T09:20:00"), end_at: iso("2026-04-09T09:20:00"), last_updated_at: iso("2026-04-06T09:20:00") },
    { id: 2, target_name: "thorium", target_email: "thorium@gamedash.test", type: "mute", scope: "chat", status: "active", severity: "medium", reason: "Spam", summary: "Mute temporaire suite à spam massif dans les commentaires.", policy_label: "Règles communautaires - spam", created_by: "enzo", assigned_to: "enzo", note: "Mute actif, surveiller les prochains commentaires.", evidence: json([{ id: "sev-3", label: "Occurrences", value: "12" }]), related_report_ids: json([3]), activity: json([{ id: "sa-2", actor: "enzo", message: "Sanction activée", createdAt: iso("2026-04-04T16:20:00") }]), appeal_count: 1, start_at: iso("2026-04-04T16:20:00"), end_at: iso("2026-04-07T16:20:00"), last_updated_at: iso("2026-04-04T16:20:00") },
    { id: 3, target_name: "raven", target_email: "raven@gamedash.test", type: "warning", scope: "profile", status: "revoked", severity: "low", reason: "Profil incomplet", summary: "Avertissement annulé après clarification utilisateur.", policy_label: "Profil public", created_by: "nova", assigned_to: "nova", note: "Révocation validée après appel.", evidence: json([{ id: "sev-4", label: "Vérification", value: "OK" }]), related_report_ids: json([]), activity: json([{ id: "sa-3", actor: "nova", message: "Sanction révoquée", createdAt: iso("2026-04-03T13:00:00") }]), appeal_count: 1, start_at: iso("2026-04-02T12:00:00"), end_at: null, last_updated_at: iso("2026-04-03T13:00:00") },
  ]);

  await knex("moderation_appeals").insert([
    { id: "APP-1001", sanction_id: 2, target_name: "thorium", sanction_type: "mute", status: "pending", message: "Je pense que mon mute est trop long, j’ai seulement copié le message une fois.", decision_note: null, submitted_at: iso("2026-04-05T10:10:00"), updated_at: iso("2026-04-05T10:10:00") },
    { id: "APP-1002", sanction_id: 3, target_name: "raven", sanction_type: "warning", status: "accepted", message: "Mon profil respectait les règles, c’était une erreur de compréhension.", decision_note: "Appel accepté après vérification du profil.", submitted_at: iso("2026-04-03T09:30:00"), updated_at: iso("2026-04-03T13:00:00") },
    { id: "APP-1003", sanction_id: 1, target_name: "shadowfox", sanction_type: "temporaryBan", status: "needsInfo", message: "Je veux contester, mais je dois retrouver la partie concernée.", decision_note: "Informations complémentaires demandées : ID de partie ou contexte exact.", submitted_at: iso("2026-04-06T10:00:00"), updated_at: iso("2026-04-06T10:20:00") },
  ]);

  await knex("moderation_audit_logs").insert([
    { id: "AUD-1001", action_key: "report_assigned", actor_name: "alice", resource_type: "report", resource_label: "Carte avec élément offensant", metadata: json(["Assigné à alice", "Sévérité critical"]), created_at: iso("2026-04-06T09:10:00") },
    { id: "AUD-1002", action_key: "report_resolved", actor_name: "enzo", resource_type: "report", resource_label: "Spam de commentaires", metadata: json(["Rapport #3", "Commentaire masqué"]), created_at: iso("2026-04-04T16:10:00") },
    { id: "AUD-1003", action_key: "content_hidden", actor_name: "system", resource_type: "content", resource_label: "Commentaire sous une carte #15", metadata: json(["Origine automated", "Toxicity threshold"]), created_at: iso("2026-04-05T17:45:00") },
    { id: "AUD-1004", action_key: "sanction_activated", actor_name: "enzo", resource_type: "sanction", resource_label: "thorium", metadata: json(["Mute chat", "3 jours"]), created_at: iso("2026-04-04T16:20:00") },
    { id: "AUD-1005", action_key: "appeal_info_requested", actor_name: "POC Admin", resource_type: "appeal", resource_label: "APP-1003", metadata: json(["Informations complémentaires demandées"]), created_at: iso("2026-04-06T10:20:00") },
  ]);

  await knex("backoffice_matchmaking_modes").insert([
    { id: 1, key: "ranked", enabled: true, max_wait_time_sec: 180, mmr_window: 150, team_size: 5, players_in_queue: 84, matches_last_hour: 142, last_updated_at: hoursAgo(6), last_updated_by: "enzo" },
    { id: 2, key: "casual", enabled: true, max_wait_time_sec: 90, mmr_window: 400, team_size: 5, players_in_queue: 156, matches_last_hour: 218, last_updated_at: hoursAgo(28), last_updated_by: "alice" },
    { id: 3, key: "fun", enabled: true, max_wait_time_sec: 60, mmr_window: 800, team_size: 3, players_in_queue: 42, matches_last_hour: 76, last_updated_at: hoursAgo(72), last_updated_by: "enzo" },
  ]);

  await knex("backoffice_matchmaking_audit").insert([
    { id: 1, mode_key: "ranked", actor: "enzo", changes: json(["maxWaitTimeSec: 240 → 180", "mmrWindow: 200 → 150"]), timestamp: hoursAgo(6) },
    { id: 2, mode_key: "casual", actor: "alice", changes: json(["mmrWindow: 350 → 400"]), timestamp: hoursAgo(28) },
    { id: 3, mode_key: "fun", actor: "enzo", changes: json(["enabled: false → true", "teamSize: 5 → 3"]), timestamp: hoursAgo(72) },
  ]);

  await knex("backoffice_dashboard_snapshots").insert([
    { period: "7d", active_users: 1842, matches_per_day: 3120, transactions_per_day: 412, maps_published: 87, virtual_revenue: 18430, pending_reports: 23, trends: json({ activeUsers: { value: "+12.4%", direction: "up" }, matchesPerDay: { value: "+5.8%", direction: "up" }, transactionsPerDay: { value: "+3.1%", direction: "up" }, mapsPublished: { value: "+8.0%", direction: "up" }, virtualRevenue: { value: "+9.7%", direction: "up" }, pendingReports: { value: "-2.5%", direction: "down" } }) },
    { period: "30d", active_users: 5294, matches_per_day: 2890, transactions_per_day: 387, maps_published: 342, virtual_revenue: 72180, pending_reports: 41, trends: json({ activeUsers: { value: "+7.2%", direction: "up" }, matchesPerDay: { value: "+2.4%", direction: "up" }, transactionsPerDay: { value: "-1.2%", direction: "down" }, mapsPublished: { value: "+14.5%", direction: "up" }, virtualRevenue: { value: "+6.1%", direction: "up" }, pendingReports: { value: "+8.4%", direction: "up" } }) },
    { period: "90d", active_users: 12480, matches_per_day: 2715, transactions_per_day: 365, maps_published: 1024, virtual_revenue: 218400, pending_reports: 58, trends: json({ activeUsers: { value: "+18.9%", direction: "up" }, matchesPerDay: { value: "+1.5%", direction: "up" }, transactionsPerDay: { value: "+0.8%", direction: "up" }, mapsPublished: { value: "+22.1%", direction: "up" }, virtualRevenue: { value: "+12.8%", direction: "up" }, pendingReports: { value: "+15.2%", direction: "up" } }) },
  ]);

  const ranks = [
    ["bronze", 4820], ["silver", 3210], ["gold", 2150], ["platinum", 1080], ["diamond", 480], ["master", 120],
  ] as const;
  for (const period of ["7d", "30d", "90d"] as const) {
    const multiplier = period === "7d" ? 1 : period === "30d" ? 1.2 : 1.45;
    await knex("backoffice_rank_distribution").insert(ranks.map(([rankKey, count]) => ({ period, rank_key: rankKey, count: Math.round(count * multiplier) })));
  }

  await knex("backoffice_top_maps").insert([
    { id: 1, title: "Neon Crucible", author: "pixelqueen", tests: 12480, rating: 4.8, position: 1 },
    { id: 2, title: "Forgotten Outpost", author: "shadowfox", tests: 9820, rating: 4.6, position: 2 },
    { id: 3, title: "Skybreaker", author: "neo_runner", tests: 8190, rating: 4.5, position: 3 },
    { id: 4, title: "Ember Run", author: "helios", tests: 7240, rating: 4.4, position: 4 },
    { id: 5, title: "Hollow Frontier", author: "raven", tests: 6510, rating: 4.3, position: 5 },
  ]);

  await knex("backoffice_top_creators").insert([
    { id: 1, name: "pixelqueen", maps_published: 24, total_tests: 38200, position: 1 },
    { id: 2, name: "shadowfox", maps_published: 18, total_tests: 29150, position: 2 },
    { id: 3, name: "neo_runner", maps_published: 15, total_tests: 22480, position: 3 },
    { id: 4, name: "mira", maps_published: 11, total_tests: 15920, position: 4 },
  ]);

  await knex("backoffice_activity_events").insert([
    { id: 1, type: "sanction", actor: "alice", target: "shadowfox", timestamp: minutesAgo(4) },
    { id: 2, type: "map", actor: "pixelqueen", target: "Neon Crucible v3", timestamp: minutesAgo(11) },
    { id: 3, type: "transaction", actor: "luna", target: "500 hard currency", timestamp: minutesAgo(18) },
    { id: 4, type: "match", actor: "neo_runner", target: "Ranked 5v5", timestamp: minutesAgo(27) },
    { id: 5, type: "map", actor: "helios", target: "Ember Run v2", timestamp: minutesAgo(42) },
    { id: 6, type: "sanction", actor: "enzo", target: "thorium", timestamp: minutesAgo(58) },
  ]);

  await knex.raw("SELECT setval(pg_get_serial_sequence('moderation_reports','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM moderation_reports), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('moderation_content_items','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM moderation_content_items), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('moderation_sanctions','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM moderation_sanctions), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('backoffice_matchmaking_modes','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM backoffice_matchmaking_modes), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('backoffice_matchmaking_audit','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM backoffice_matchmaking_audit), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('backoffice_top_maps','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM backoffice_top_maps), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('backoffice_top_creators','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM backoffice_top_creators), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('backoffice_activity_events','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM backoffice_activity_events), 1))");
}

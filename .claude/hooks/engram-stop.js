/**
 * Stop hook: Engram Session Summary Reminder
 * Recuerda al agente que debe ejecutar mem_session_summary antes de cerrar.
 * Exit 0 = permitir (solo es un recordatorio via stderr)
 */
process.stderr.write(
  'RECORDATORIO: Ejecutar mem_session_summary antes de cerrar la sesion. ' +
  'Incluir: Goal, Accomplished, Discoveries, Next Steps, Relevant Files.'
);
process.exit(0);

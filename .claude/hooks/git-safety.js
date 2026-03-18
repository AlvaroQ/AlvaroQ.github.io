/**
 * PreToolUse hook: Git Safety
 * Bloquea comandos git destructivos antes de que se ejecuten.
 * Exit 0 = allow, Exit 2 = block (stderr se muestra a Claude)
 */
const input = [];
process.stdin.on('data', (chunk) => input.push(chunk));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(Buffer.concat(input).toString());
    const command = data.tool_input?.command || '';

    // Patrones bloqueados
    const blocked = [
      { pattern: /\bgit\s+merge\b/i, reason: 'git merge prohibido - merges son responsabilidad del usuario' },
      { pattern: /\bgit\s+rebase\b/i, reason: 'git rebase prohibido' },
      { pattern: /\bgit\s+push\b.*\b(main|master)\b/i, reason: 'git push a main/master prohibido' },
      { pattern: /\bgit\s+push\s+--force\b/i, reason: 'git push --force prohibido' },
      { pattern: /\bgit\s+push\s+-f\b/i, reason: 'git push -f prohibido' },
      { pattern: /\bgit\s+push\s+--force-with-lease\b/i, reason: 'git push --force-with-lease prohibido' },
      { pattern: /\bgit\s+reset\s+--hard\b/i, reason: 'git reset --hard prohibido sin confirmacion' },
      { pattern: /\bgit\s+checkout\s+main\b/i, reason: 'git checkout main prohibido' },
      { pattern: /\bgit\s+checkout\s+master\b/i, reason: 'git checkout master prohibido' },
      { pattern: /\bgit\s+clean\s+-f/i, reason: 'git clean -f prohibido' },
      { pattern: /\bgit\s+branch\s+-D\b/i, reason: 'git branch -D prohibido sin confirmacion' },
      { pattern: /\bgit\s+stash\s+drop\b/i, reason: 'git stash drop prohibido - puede perder trabajo' },
      { pattern: /\bgit\s+stash\s+clear\b/i, reason: 'git stash clear prohibido - borra todo el stash' },
      { pattern: /\bgit\s+checkout\s+\.\s*$/i, reason: 'git checkout . prohibido - descarta todos los cambios no commiteados' },
      { pattern: /\bgit\s+restore\s+\./i, reason: 'git restore . prohibido - descarta todos los cambios no commiteados' },
    ];

    for (const { pattern, reason } of blocked) {
      if (pattern.test(command)) {
        process.stderr.write(`BLOQUEADO: ${reason}. Comando: ${command}`);
        process.exit(2);
      }
    }

    process.exit(0);
  } catch {
    // En caso de error en el hook, permitir la ejecucion
    process.exit(0);
  }
});

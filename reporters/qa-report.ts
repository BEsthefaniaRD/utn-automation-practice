import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { testCases, type Prioridad } from '../test-data/test-cases';

/**
 * Reporte QA: genera una tabla con los resultados de cada test en
 * HTML (para leer o imprimir) y CSV (para abrir en Excel).
 *
 * Columnas: # · Categoría · Caso de prueba · Criterio de aceptación ·
 * Prioridad · Resultado · Notas / Evidencia · Responsable · Fecha
 */

type Options = {
  /** Carpeta donde se escribe el reporte */
  outputFolder?: string;
  /** Nombre que aparece en la columna Responsable */
  responsable?: string;
  /** Título del reporte */
  titulo?: string;
};

type Resultado = 'Pasó' | 'Falló' | 'Inestable' | 'Omitido';

type Row = {
  numero: number;
  categoria: string;
  caso: string;
  criterio: string;
  prioridad: Prioridad;
  resultado: Resultado;
  notas: string;
  evidencias: string[];
  responsable: string;
  fecha: Date;
};

/** Anotaciones de Playwright que no son notas para el reporte */
const IGNORED_ANNOTATIONS = new Set(['skip', 'fixme', 'fail', 'slow']);

class QaReporter implements Reporter {
  private readonly outputFolder: string;
  private readonly responsable: string;
  private readonly titulo: string;
  private suite!: Suite;
  private config!: FullConfig;
  private readonly startTime = new Date();

  constructor(options: Options = {}) {
    this.outputFolder = options.outputFolder ?? 'qa-report';
    this.responsable = options.responsable ?? 'Sin asignar';
    this.titulo = options.titulo ?? 'Reporte de pruebas';
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.suite = suite;
  }

  async onEnd(result: FullResult): Promise<void> {
    const projectDir = this.config.configFile ? path.dirname(this.config.configFile) : process.cwd();
    const outDir = path.resolve(projectDir, this.outputFolder);
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(path.join(outDir, 'evidencias'), { recursive: true });

    const multipleProjects = this.config.projects.length > 1;
    const missing: string[] = [];

    const rows: Row[] = this.suite.allTests().map((test, index) => {
      const key = `${path.basename(test.location.file)} › ${test.title}`;
      const info = testCases[key];
      if (!info) missing.push(key);

      const last = test.results[test.results.length - 1];
      const numero = index + 1;
      const project = test.parent.project()?.name;

      return {
        numero,
        categoria: info?.categoria ?? this.describeTitle(test),
        caso: multipleProjects && project ? `${test.title} (${project})` : test.title,
        criterio: info?.criterio ?? 'Sin definir: agregar el caso en test-data/test-cases.ts',
        prioridad: info?.prioridad ?? 'Media',
        resultado: this.resultado(test),
        notas: this.notas(test, last),
        evidencias: this.copyEvidence(last, numero, outDir),
        responsable: this.responsable,
        fecha: last?.startTime ?? this.startTime,
      };
    });

    const summary = {
      total: rows.length,
      pasadas: rows.filter((r) => r.resultado === 'Pasó').length,
      fallidas: rows.filter((r) => r.resultado === 'Falló').length,
      inestables: rows.filter((r) => r.resultado === 'Inestable').length,
      omitidas: rows.filter((r) => r.resultado === 'Omitido').length,
      duracion: result.duration,
    };

    fs.writeFileSync(path.join(outDir, 'reporte-pruebas.html'), this.toHtml(rows, summary));
    fs.writeFileSync(path.join(outDir, 'reporte-pruebas.csv'), this.toCsv(rows, summary));

    if (missing.length > 0) {
      console.log(`\n[qa-report] ${missing.length} test(s) sin datos en test-data/test-cases.ts:`);
      for (const key of missing) console.log(`  - ${key}`);
    }
    console.log(`\n[qa-report] Reporte generado en ${path.relative(process.cwd(), outDir)}${path.sep}reporte-pruebas.html`);
  }

  private describeTitle(test: TestCase): string {
    // titlePath: ['', proyecto, archivo, ...describes, test]
    const describes = test.titlePath().slice(3, -1);
    return describes[0] ?? path.basename(test.location.file);
  }

  private resultado(test: TestCase): Resultado {
    switch (test.outcome()) {
      case 'expected':
        return 'Pasó';
      case 'flaky':
        return 'Inestable';
      case 'skipped':
        return 'Omitido';
      default:
        return 'Falló';
    }
  }

  private notas(test: TestCase, last: TestResult | undefined): string {
    if (!last) return '';
    const parts: string[] = [];

    if (test.outcome() === 'skipped') {
      const reason = test.annotations.find((a) => a.type === 'skip')?.description;
      return reason ? `Omitido: ${reason}` : 'Omitido';
    }

    if (last.status !== 'passed' && last.error?.message) {
      parts.push(stripAnsi(last.error.message).split('\n').find((l) => l.trim()) ?? 'Error');
    }
    if (test.outcome() === 'flaky') {
      parts.push(`Pasó en el reintento ${last.retry}`);
    }

    // Mediciones que los tests agregan como anotaciones (p. ej. tiempos de performance)
    const metrics = last.annotations
      .filter((a) => !IGNORED_ANNOTATIONS.has(a.type) && a.description)
      .map((a) => `${a.type}: ${a.description}`);
    if (metrics.length > 0) parts.push(metrics.join(' · '));

    parts.push(`Duración: ${formatMs(last.duration)}`);
    return parts.join(' | ');
  }

  /** Copia capturas, videos y trazas del test a qa-report/evidencias. */
  private copyEvidence(last: TestResult | undefined, numero: number, outDir: string): string[] {
    if (!last) return [];
    const copied: string[] = [];
    for (const attachment of last.attachments) {
      if (!attachment.path || !fs.existsSync(attachment.path)) continue;
      const fileName = `${String(numero).padStart(2, '0')}-${attachment.name}${path.extname(attachment.path)}`;
      fs.copyFileSync(attachment.path, path.join(outDir, 'evidencias', fileName));
      copied.push(`evidencias/${fileName}`);
    }
    return copied;
  }

  private toCsv(rows: Row[], summary: Summary): string {
    const header = ['#', 'Categoría', 'Caso de prueba', 'Criterio de aceptación', 'Prioridad', 'Resultado', 'Notas / Evidencia', 'Responsable', 'Fecha'];
    const lines = [
      [this.titulo],
      ['Fecha de ejecución', formatDate(this.startTime)],
      ['Total de pruebas', summary.total],
      ['Pasadas', summary.pasadas],
      ['Fallidas', summary.fallidas],
      ['Inestables', summary.inestables],
      ['Omitidas', summary.omitidas],
      [],
      header,
      ...rows.map((r) => [
        r.numero,
        r.categoria,
        r.caso,
        r.criterio,
        r.prioridad,
        r.resultado,
        [r.notas, ...r.evidencias].filter(Boolean).join(' | '),
        r.responsable,
        formatDate(r.fecha),
      ]),
    ];
    // ";" como separador y BOM UTF-8 para que Excel en español lo abra con acentos y columnas correctas.
    return '﻿' + lines.map((cols) => cols.map(csvCell).join(';')).join('\r\n');
  }

  private toHtml(rows: Row[], summary: Summary): string {
    const exito = summary.total ? Math.round((summary.pasadas / summary.total) * 100) : 0;
    const badge: Record<Resultado, string> = {
      'Pasó': 'ok',
      'Falló': 'fail',
      'Inestable': 'flaky',
      'Omitido': 'skip',
    };

    const body = rows
      .map(
        (r) => `
        <tr>
          <td class="num">${r.numero}</td>
          <td>${esc(r.categoria)}</td>
          <td>${esc(r.caso)}</td>
          <td>${esc(r.criterio)}</td>
          <td><span class="prio prio-${r.prioridad.toLowerCase()}">${r.prioridad}</span></td>
          <td><span class="res res-${badge[r.resultado]}">${r.resultado}</span></td>
          <td class="notes">${esc(r.notas)}${r.evidencias
            .map((e) => `<br><a href="${esc(e)}">${esc(path.basename(e))}</a>`)
            .join('')}</td>
          <td>${esc(r.responsable)}</td>
          <td class="date">${formatDate(r.fecha)}</td>
        </tr>`,
      )
      .join('');

    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(this.titulo)}</title>
<style>
  :root {
    --bg: #f6f7f9; --card: #fff; --text: #1d2330; --muted: #5f6b7a; --border: #dde1e7;
    --ok: #1a7f37; --ok-bg: #dcf5e3; --fail: #c62828; --fail-bg: #fde2e1;
    --flaky: #9a6700; --flaky-bg: #fff4ce; --skip: #57606a; --skip-bg: #eaeef2;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f1115; --card: #181b22; --text: #e6e8ec; --muted: #9aa4b2; --border: #2b303b;
      --ok: #56d364; --ok-bg: #12301b; --fail: #ff7b72; --fail-bg: #3b1616;
      --flaky: #e3b341; --flaky-bg: #3a2e0c; --skip: #9aa4b2; --skip-bg: #262b34;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 16px; background: var(--bg); color: var(--text);
         font: 14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 1400px; margin: 0 auto; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  .meta { color: var(--muted); margin-bottom: 20px; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .stat { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; }
  .stat .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  .stat .value { font-size: 26px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .stat.ok .value { color: var(--ok); } .stat.fail .value { color: var(--fail); }
  .table-wrap { overflow-x: auto; background: var(--card); border: 1px solid var(--border); border-radius: 8px; }
  table { border-collapse: collapse; width: 100%; min-width: 1100px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
  th { position: sticky; top: 0; background: var(--card); font-size: 12px; text-transform: uppercase;
       letter-spacing: .04em; color: var(--muted); }
  tr:last-child td { border-bottom: 0; }
  .num, .date { white-space: nowrap; font-variant-numeric: tabular-nums; }
  .notes { color: var(--muted); font-size: 13px; max-width: 360px; word-break: break-word; }
  .notes a { color: inherit; }
  .res, .prio { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .res-ok { color: var(--ok); background: var(--ok-bg); }
  .res-fail { color: var(--fail); background: var(--fail-bg); }
  .res-flaky { color: var(--flaky); background: var(--flaky-bg); }
  .res-skip { color: var(--skip); background: var(--skip-bg); }
  .prio { border: 1px solid var(--border); font-weight: 500; }
  .prio-alta { border-color: var(--fail); color: var(--fail); }
  @media print {
    body { background: #fff; padding: 0; }
    .table-wrap { overflow: visible; border: 0; }
    table { min-width: 0; font-size: 11px; }
    th { position: static; }
  }
</style>
</head>
<body>
<main>
  <h1>${esc(this.titulo)}</h1>
  <div class="meta">Ejecutado el ${formatDate(this.startTime)} · Duración total ${formatMs(summary.duracion)} · Responsable: ${esc(this.responsable)}</div>

  <section class="summary">
    <div class="stat"><div class="label">Total de pruebas</div><div class="value">${summary.total}</div></div>
    <div class="stat ok"><div class="label">Pasadas</div><div class="value">${summary.pasadas}</div></div>
    <div class="stat fail"><div class="label">Fallidas</div><div class="value">${summary.fallidas}</div></div>
    ${summary.inestables ? `<div class="stat"><div class="label">Inestables</div><div class="value">${summary.inestables}</div></div>` : ''}
    ${summary.omitidas ? `<div class="stat"><div class="label">Omitidas</div><div class="value">${summary.omitidas}</div></div>` : ''}
    <div class="stat"><div class="label">% de éxito</div><div class="value">${exito}%</div></div>
  </section>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th><th>Categoría</th><th>Caso de prueba</th><th>Criterio de aceptación</th>
          <th>Prioridad</th><th>Resultado</th><th>Notas / Evidencia</th><th>Responsable</th><th>Fecha</th>
        </tr>
      </thead>
      <tbody>${body}
      </tbody>
    </table>
  </div>
</main>
</body>
</html>
`;
  }
}

type Summary = {
  total: number;
  pasadas: number;
  fallidas: number;
  inestables: number;
  omitidas: number;
  duracion: number;
};

function formatDate(date: Date): string {
  return date.toLocaleString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatMs(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function csvCell(value: unknown): string {
  const text = String(value ?? '');
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

export default QaReporter;

import { DIMENSIONS } from '../data/dimensions.js'

function formatScore(value) {
  return Math.round(value ?? 0)
}

export function DimensionBars({
  compareLabel = '他评后',
  compareScores = null,
  scores,
  title = '12 个维度分数',
}) {
  return (
    <section className="rounded-[28px] border border-ink/10 bg-paper/75 p-5 shadow-card md:p-6">
      <div className="flex flex-col gap-2 border-b border-dashed border-ink/20 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate">Dimension Index</p>
          <h3 className="mt-2 text-xl font-bold text-ink">{title}</h3>
        </div>
        {compareScores && (
          <div className="flex items-center gap-3 text-xs text-slate">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-full bg-ink/25" />
              系统初评
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-full bg-ink" />
              {compareLabel}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3">
        {DIMENSIONS.map((dimension) => {
          const value = scores[dimension.key] ?? 0
          const compareValue = compareScores?.[dimension.key]

          return (
            <div key={dimension.key} className="rounded-2xl border border-ink/10 bg-paper/60 p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{dimension.label}</p>
                  <p className="mt-1 truncate text-xs text-slate">{dimension.description}</p>
                </div>
                <div className="flex items-baseline gap-2 font-mono text-sm text-ink">
                  <span>{formatScore(value)}</span>
                  {compareScores && <span className="text-slate">→ {formatScore(compareValue)}</span>}
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="h-2.5 overflow-hidden rounded-full bg-mist/70">
                  <div
                    className="h-full rounded-full bg-ink/30 transition-all duration-500"
                    style={{ width: `${Math.max(4, value)}%` }}
                  />
                </div>
                {compareScores && (
                  <div className="h-2.5 overflow-hidden rounded-full bg-mist/70">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, compareValue)}%`,
                        backgroundColor: dimension.color,
                      }}
                    />
                  </div>
                )}
                {!compareScores && (
                  <div className="h-2.5 overflow-hidden rounded-full bg-mist/70">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, value)}%`, backgroundColor: dimension.color }}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

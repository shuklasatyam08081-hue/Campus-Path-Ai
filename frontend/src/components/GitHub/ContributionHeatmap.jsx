import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '../../api/client';

/**
 * GitHub Contribution Heatmap — Mirror-Match Edition
 * Renders a pixel-perfect replica of GitHub's contribution graph
 * using the official GraphQL API data structure (weeks → contributionDays).
 */

// ── Cell size & gap must match GitHub exactly ────────────────────────────────
const CELL = 10;  // px
const GAP = 3;   // px
const COL = CELL + GAP; // 13px per column

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="w-full p-5 bg-card rounded-xl border border-border animate-pulse shadow-sm">
      <div className="h-3 w-52 bg-muted rounded mb-6" />
      <div className="flex gap-[3px]" style={{ height: 7 * COL - GAP }}>
        {Array.from({ length: 53 }).map((_, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, di) => (
              <div key={di} style={{ width: CELL, height: CELL }} className="rounded-[2px] bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  const shades = ['var(--color-muted)', '#064e3b', '#047857', '#10b981', '#34d399'];
  return (
    <div className="flex items-center gap-[6px] text-[11px] text-muted-foreground">
      <span>Less</span>
      {shades.map(c => (
        <div key={c} style={{ width: CELL, height: CELL, backgroundColor: c, borderRadius: 2 }} />
      ))}
      <span>More</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const GITHUB_USERNAME = 'Shubham-k-yadav'; // Your real GitHub username

// Map contribution count → Theme purple shades
function getDarkColor(count) {
  if (!count || count === 0) return 'var(--color-muted)';
  if (count <= 3) return '#064e3b';
  if (count <= 6) return '#047857';
  if (count <= 9) return '#10b981';
  return '#34d399';
}

export default function ContributionHeatmap({ username = GITHUB_USERNAME }) {
  const [data, setData] = useState(null);   // GitHub calendar object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState(null);   // { day, x, y }

  // Fetch via our secure backend proxy
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    githubAPI.getHeatmap(username)
      .then(res => {
        if (!cancelled) setData(res.data.data); // contributionCalendar object
      })
      .catch(err => {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to fetch');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [username]);

  // Build month labels: one label per month, positioned at the week-column
  // where the first day of that month appears.
  const monthLabels = useMemo(() => {
    if (!data) return [];
    const labels = [];
    data.weeks.forEach((week, wi) => {
      // Find first day in this week that is day-of-month === 1
      const newMonthDay = week.contributionDays.find(d => new Date(d.date).getDate() === 1);
      if (newMonthDay) {
        const monthName = new Date(newMonthDay.date).toLocaleString('en-US', { month: 'short' });
        // Avoid duplicating the same month label if pushed in already
        if (!labels.length || labels[labels.length - 1].label !== monthName) {
          labels.push({ label: monthName, weekIndex: wi });
        }
      }
    });
    return labels;
  }, [data]);

  // ── Render states ────────────────────────────────────────────────────────
  if (loading) return <Skeleton />;

  if (error || !data || !data.weeks) return (
    <div className="p-6 bg-card rounded-xl border border-destructive/40 text-destructive text-sm shadow-sm">
      <div className="font-semibold mb-1">Cannot load heatmap</div>
      <div className="opacity-75 text-xs">{error || 'Incomplete data received'}</div>
      <div className="mt-2 text-xs opacity-50 font-mono">
        Check backend console and GITHUB_TOKEN permissions.
      </div>
    </div>
  );

  const { weeks, totalContributions } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full p-5 bg-card rounded-xl border border-border shadow-sm relative select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] text-foreground font-medium">
          {(totalContributions || 0).toLocaleString()} contributions in the last year
        </span>
      </div>

      {/* Grid */}
      <div className="flex gap-[3px]" style={{ userSelect: 'none' }}>
        {/* Day-of-week sidebar */}
        <div
          className="flex flex-col justify-between text-[9px] text-muted-foreground pr-[6px]"
          style={{ marginTop: 16 + GAP, height: 7 * COL - GAP }}
        >
          <span />
          <span>Mon</span>
          <span />
          <span>Wed</span>
          <span />
          <span>Fri</span>
          <span />
        </div>

        {/* Weeks */}
        <div style={{ position: 'relative' }}>
          {/* Month labels */}
          <div style={{ height: 16, position: 'relative', marginBottom: GAP }}>
            {monthLabels.map(({ label, weekIndex }) => (
              <span
                key={`${label}-${weekIndex}`}
                className="absolute text-[10px] text-muted-foreground"
                style={{ left: weekIndex * COL }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Week columns */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.contributionDays.map(day => {
                  const count = day.contributionCount;
                  const bg = count > 0 ? day.color : '#161b22';
                  const today = day.date === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={day.date}
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: getDarkColor(day.contributionCount),
                        borderRadius: 2,
                        outline: today ? '1px solid rgba(16,185,129,0.5)' : undefined,
                        outlineOffset: 1,
                        cursor: 'pointer',
                        transition: 'filter 0.1s',
                      }}
                      onMouseEnter={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ day, x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-emerald-500 hover:underline"
        >
          Learn how we count contributions
        </a>
        <Legend />
      </div>

      {/* Tooltip (portal-like, fixed position) */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, calc(-100% - 8px))',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="bg-card border border-border rounded-md px-3 py-2 shadow-2xl whitespace-nowrap"
          >
            <div className="text-[12px] font-semibold text-foreground">
              {tooltip.day.contributionCount === 0
                ? 'No contributions'
                : `${tooltip.day.contributionCount} contribution${tooltip.day.contributionCount !== 1 ? 's' : ''}`}
            </div>
            <div className="text-[11px] text-muted-foreground mt-[1px]">
              {new Date(tooltip.day.date).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
              })}
            </div>
            {/* Arrow */}
            <div style={{
              position: 'absolute', bottom: -6, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--color-border)',
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

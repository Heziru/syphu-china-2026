import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { type TeamPerson } from "./teamData";
import { PersonCard } from "./Portrait";
import { useReducedMotion } from "../home/hooks/useReducedMotion";

export function InfinitePeople({
  people,
  onSelect,
}: {
  people: TeamPerson[];
  onSelect: (person: TeamPerson, element: HTMLElement) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const moved = useRef(false);
  const [tileCount, setTileCount] = useState(42);
  const position = useRef({ x: 0, y: 0 });
  const pan = useRef<(dx: number, dy: number) => void>(() => {});
  useLayoutEffect(() => {
    const area = root.current;
    if (!area) return;
    const tiles = Array.from(
      area.querySelectorAll<HTMLElement>(".team-floating-card"),
    );
    let width = area.clientWidth,
      height = area.clientHeight;
    let cellW = 0,
      cellH = 0,
      columns = 0,
      rows = 0;
    let x = position.current.x,
      y = position.current.y,
      vx = 0,
      vy = 0,
      drag = false,
      lastX = 0,
      lastY = 0,
      startX = 0,
      startY = 0;
    let frame = 0,
      lastTime = 0;
    const wrap = (n: number, size: number) => ((n % size) + size) % size;
    function layout() {
      width = area!.clientWidth;
      height = area!.clientHeight;
      cellW = width < 600 ? 200 : Math.max(240, Math.min(330, width / 4.35));
      cellH = cellW * 1.39;
      columns = Math.ceil(width / cellW) + 2;
      // Keep every canonical member in the repeating field, even on a phone.
      rows = Math.max(
        Math.ceil(height / cellH) + 2,
        Math.ceil(people.length / columns),
      );
      if (tileCount !== columns * rows) {
        setTileCount(columns * rows);
        return;
      }
      draw();
    }
    function draw() {
      tiles.forEach((tile, i) => {
        const col = i % columns,
          row = Math.floor(i / columns);
        if (row >= rows) {
          tile.style.display = "none";
          return;
        }
        tile.style.display = "";
        tile.style.visibility = "visible";
        const px = wrap(col * cellW + x + cellW, columns * cellW) - cellW;
        const py =
          wrap(
            row * cellH + y + (col % 2) * cellH * 0.47 + cellH,
            rows * cellH,
          ) - cellH;
        tile.style.width = `${cellW * 0.77}px`;
        tile.style.transform = `translate3d(${px}px,${py}px,0) rotate(${((i % 3) - 1) * 2.2}deg)`;
        const visible =
          px > -cellW * 0.6 &&
          px < width - 40 &&
          py > -cellH * 0.55 &&
          py < height - 80;
        const fullyVisible =
          px >= 12 &&
          px + cellW * 0.77 < width - 12 &&
          py >= 12 &&
          py + (cellW * 0.77 * 4) / 3 + 68 < height - 12;
        tile.tabIndex = fullyVisible ? 0 : -1;
        tile.setAttribute("aria-hidden", String(!visible));
      });
    }
    function tick(time: number) {
      const dt = lastTime ? Math.min((time - lastTime) / 16.667, 2) : 1;
      lastTime = time;
      if (!drag) {
        x += vx * dt;
        y += vy * dt;
        vx *= Math.pow(0.91, dt);
        vy *= Math.pow(0.91, dt);
      }
      draw();
      if (drag || Math.abs(vx) + Math.abs(vy) > 0.08)
        frame = requestAnimationFrame(tick);
      else frame = 0;
    }
    function wake() {
      if (!frame) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    }
    function down(e: PointerEvent) {
      if (e.button !== 0) return;
      drag = true;
      moved.current = false;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      vx = vy = 0;
      area!.classList.add("is-dragging");
      wake();
    }
    function move(e: PointerEvent) {
      if (!drag) return;
      const dx = e.clientX - lastX,
        dy = e.clientY - lastY;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 7)
        moved.current = true;
      // On touch, vertical gestures remain native page scrolling.
      x += dx;
      const fieldY = e.pointerType === "touch" ? dx * 0.3 : dy;
      y += fieldY;
      vx = reduced ? 0 : dx;
      vy = reduced ? 0 : fieldY;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function up() {
      drag = false;
      area!.classList.remove("is-dragging");
    }
    function wheel(e: WheelEvent) {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        x -= e.deltaX || e.deltaY;
        wake();
      }
    }
    pan.current = (dx, dy) => {
      x += dx * cellW;
      // A diagonal step reveals every row without trapping page scrolling.
      y += (dy + dx * 0.3) * cellH;
      vx = vy = 0;
      draw();
    };
    const resize = new ResizeObserver(layout);
    resize.observe(area);
    area.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    area.addEventListener("wheel", wheel, { passive: false });
    layout();
    return () => {
      position.current = { x, y };
      cancelAnimationFrame(frame);
      resize.disconnect();
      area.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
      area.removeEventListener("wheel", wheel);
    };
  }, [people, reduced, tileCount]);
  function select(e: MouseEvent<HTMLButtonElement>, person: TeamPerson) {
    if (!moved.current || e.detail === 0) onSelect(person, e.currentTarget);
  }
  return (
    <div className="team-infinite-wrap">
      <div
        className="team-infinite"
        ref={root}
        role="region"
        aria-label="Draggable team portrait gallery"
        aria-describedby="team-drag-help"
      >
        {Array.from({ length: tileCount }, (_, i) => {
          const cycle = Math.floor(i / people.length);
          const p =
            people[(i + cycle * Math.ceil(people.length / 2)) % people.length];
          return (
            <button
              className="team-floating-card"
              key={`${i}-${p.id}`}
              data-member-id={p.id}
              aria-label={`Meet ${p.name}`}
              onClick={(e) => select(e, p)}
            >
              <PersonCard person={p} />
            </button>
          );
        })}
      </div>
      <div className="team-canvas-footer">
        <span id="team-drag-help">DRAG TO DISCOVER · TAP TO MEET</span>
        <div>
          <button
            onClick={() => pan.current(1, 0)}
            aria-label="Browse previous portraits"
          >
            ←
          </button>
          <button
            onClick={() => pan.current(-1, 0)}
            aria-label="Browse next portraits"
          >
            →
          </button>
        </div>
        <a href="#team-guidance">Meet our advisors ↘</a>
      </div>
    </div>
  );
}

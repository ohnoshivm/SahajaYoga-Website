// Fills shared parts into the artboards: header, mala seeds, calendars.
const tpl = document.getElementById("header");
document.querySelectorAll("[data-header]").forEach((slot) => {
  const node = tpl.content.firstElementChild.cloneNode(true);
  if (slot.dataset.header === "phone") {
    node.classList.add("hd--phone");
    node.querySelector(".hd__nav").innerHTML = '<a class="pill pill--sm">Menu</a>';
  }
  if (slot.dataset.active) node.querySelectorAll(".pill").forEach((p) => p.textContent.toLowerCase().startsWith(slot.dataset.active) && p.classList.add("pill--on"));
  slot.replaceWith(node);
});

// <svg data-seeds="arc|ring|row" data-lit="7" data-now="8" data-r="300" data-span="120">
const NS = "http://www.w3.org/2000/svg";
document.querySelectorAll("svg[data-seeds]").forEach((svg) => {
  const kind = svg.dataset.seeds, lit = Number(svg.dataset.lit ?? 0), now = Number(svg.dataset.now ?? 0);
  const n = Number(svg.dataset.n ?? 10), size = Number(svg.dataset.size ?? 7);
  const W = svg.width.baseVal.value || svg.getBoundingClientRect().width, H = svg.height.baseVal.value || svg.getBoundingClientRect().height;
  const pts = [];
  if (kind === "row") {
    const gap = (W - size * 4) / (n - 1);
    for (let i = 0; i < n; i++) pts.push([size * 2 + i * gap, H / 2]);
  } else {
    const r = Number(svg.dataset.r ?? 300), span = (Number(svg.dataset.span ?? 120) * Math.PI) / 180;
    const cx = W / 2, cy = kind === "ring" ? H / 2 : H / 2 - r;
    for (let i = 0; i < n; i++) {
      const a = kind === "ring" ? -Math.PI / 2 + (i / n) * Math.PI * 2 : Math.PI / 2 + span / 2 - (i / (n - 1)) * span;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  pts.forEach(([x, y], i) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", size);
    c.setAttribute("class", i < lit ? "seed seed--on" : i === now - 1 ? "seed seed--now" : "seed");
    svg.appendChild(c);
    if (i === lit - 1 && svg.dataset.halo !== "off") {
      const h = document.createElementNS(NS, "circle");
      h.setAttribute("cx", x); h.setAttribute("cy", y); h.setAttribute("r", size * 2.3); h.setAttribute("class", "seed-halo");
      svg.appendChild(h);
    }
  });
});

document.querySelectorAll("[data-cal]").forEach((el) => {
  // a month of practice: each day a circle sized by minutes sat
  const mins = el.dataset.cal.split(",").map(Number), today = Number(el.dataset.today);
  for (let k = 0; k < Number(el.dataset.offset ?? 0); k++) el.appendChild(document.createElement("div"));
  mins.forEach((m, i) => {
    const d = document.createElement("div");
    d.className = "cal__day" + (i + 1 === today ? " cal__day--today" : "") + (i + 1 > today ? " cal__day--future" : "");
    const dot = document.createElement("span");
    const s = m ? 8 + Math.min(m, 45) * 0.6 : 4;
    dot.style.width = dot.style.height = s + "px";
    if (!m) dot.className = "empty";
    d.appendChild(dot);
    const n = document.createElement("i"); n.textContent = i + 1; d.appendChild(n);
    el.appendChild(d);
  });
});
document.documentElement.dataset.ready = "1";

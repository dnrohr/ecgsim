const status = document.querySelector("[data-case-status]");
const shell = document.querySelector("[data-viewer-shell]");

function drawTrace(canvas, color, phase) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = "rgba(140, 150, 160, 0.35)";
  context.lineWidth = 1;
  for (let y = 40; y < height; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.beginPath();
  for (let x = 0; x < width; x += 4) {
    const t = x / width;
    const y = height * 0.5 + Math.sin(t * Math.PI * 6 + phase) * 35 * Math.exp(-t * 0.7);
    if (x === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();
}

function mount() {
  if (!shell || !status) {
    throw new Error("Viewer shell did not mount");
  }
  shell.dataset.ready = "true";
  drawTrace(document.querySelector("[data-tmp-canvas]"), "#b3261e", 0.2);
  drawTrace(document.querySelector("[data-leads-canvas]"), "#175c8a", 1.3);
}

mount();

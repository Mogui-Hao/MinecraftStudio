// // src/utils/animations.ts
// export function deleteParticles(container: HTMLElement) {
//   console.log("创建一次")
//   // const rect = container.getBoundingClientRect();
//   // const centerX = rect.left + rect.width / 2;
//   // const centerY = rect.top + rect.height / 2;
//   const rect = container.getBoundingClientRect();
//
//   // 添加视窗边界检查
//   const centerX = Math.max(0, Math.min(window.innerWidth, rect.left + rect.width / 2));
//   const centerY = Math.max(0, Math.min(window.innerHeight, rect.top + rect.height / 2));
//
//
//   for (let i = 0; i < 8; i++) {
//     const particle = document.createElement("div");
//     particle.className = "particle-effect";
//
//     // 设置初始位置
//     particle.style.left = `${centerX}px`;
//     particle.style.top = `${centerY}px`;
//
//     const angle = Math.random() * Math.PI * 2; // 生成一个0到2π之间的随机角度
//     const distance = Math.random() * 50 + 50; // 生成一个50到100之间的随机单位距离
//     const deltaX = Math.cos(angle) * distance; // 根据角度和距离计算deltaX, 对angle进行余弦计算
//     const deltaY = Math.sin(angle) * distance; // 根据角度和距离计算deltaY, 对angle进行余弦计算
//
//     document.body.appendChild(particle);
//
//     // 触发动画
//     requestAnimationFrame(() => {
//       particle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
//       particle.style.opacity = "0";
//     });
//
//     // 移除元素
//     setTimeout(() => particle.remove(), 500);
//   }
// }
export function deleteParticles(container: HTMLElement | null) {
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("div");
    particle.className = "particle-effect";
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 50;
    const deltaX = Math.cos(angle) * distance;
    const deltaY = Math.sin(angle) * distance;

    document.body.appendChild(particle);

    // 强制重绘
    requestAnimationFrame(() => {
      particle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      particle.style.opacity = "0";
    });

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 500);
  }
}

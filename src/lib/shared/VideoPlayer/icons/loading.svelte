<script>
  import { uniqueId } from "$lib/shared/utils/utilities.js";
  const gradientId = uniqueId("g-videoplayer-loading-gradient-");
  const maskId = uniqueId("g-videoplayer-loading-mask-");
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 70 70"
>
  <defs>
    <linearGradient
      id={gradientId}
      x1="37.18"
      y1="35"
      x2="72.18"
      y2="70"
      gradientTransform="translate(-2.18)"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0.17" stop-color="#fff" />
      <stop offset="0.18" stop-color="#fefdfd" />
      <stop offset="0.35" stop-color="#bcbbbb" />
      <stop offset="0.52" stop-color="#858384" />
      <stop offset="0.67" stop-color="#5b5859" />
      <stop offset="0.81" stop-color="#3c393a" /><stop
        offset="0.92"
        stop-color="#2a2627"
      />
      <stop offset="1" stop-color="#231f20" />
    </linearGradient>
    <mask
      id={maskId}
      x="35"
      y="35"
      width="35"
      height="35"
      maskUnits="userSpaceOnUse"
    >
      <rect
        fill="url(#{gradientId})"
        x="35"
        y="35"
        width="35"
        height="35"
        transform="translate(0 105) rotate(-90)"
      />
    </mask>
  </defs>
  <g mask="url(#{maskId})">
    <path d="M70,35H60A25,25,0,0,1,35,60V70A35,35,0,0,0,70,35Z" />
  </g>
  <path d="M70,35h0v1.56C70,36,70,35.52,70,35Z" />
  <path d="M35,70V60a25,25,0,0,1,0-50V0a35,35,0,0,0,0,70c.52,0,1,0,1.56,0Z" />
</svg>

<style>
  path {
    fill: white;
  }
</style>

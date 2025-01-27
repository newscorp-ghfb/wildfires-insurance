<script>
  // export let props;
  import bought_house from "$lib/project/Topper/videos/bought_house.mp4";
  import gymnastics from "$lib/project/Topper/videos/gymnastics.mp4";
  import parents_home from "$lib/project/Topper/videos/parents_home.mp4";
  import parents_job from "$lib/project/Topper/videos/parents_job.mp4";
  import parents_money from "$lib/project/Topper/videos/parents_money.mp4";
  import parents_vs_me from "$lib/project/Topper/videos/parents_vs_me.mp4";

  // export let videos = [
  //   bought_house,
  //   gymnastics,
  //   parents_home,
  //   parents_job,
  //   parents_money,
  //   parents_vs_me,
  // ]; // Array of video URLs

  export let videos = [
    "https://int.nyt.com/data/videotape/finished/2023/11/1700082939/03-wyatt_02-v06-new-640w.mp4",
    "https://int.nyt.com/data/videotape/finished/2023/11/1699890823/10-decline_montage-v02-900w.mp4",
    "https://int.nyt.com/data/videotape/finished/2023/11/1699890823/11-club-v05-900w.mp4",
    "https://int.nyt.com/data/videotape/finished/2023/11/1699890823/13-clarity-v06-900w.mp4",
    "https://int.nyt.com/data/videotape/finished/2023/11/1699890823/13-clarity-v06-900w.mp4",
    "https://int.nyt.com/data/videotape/finished/2023/11/1700082939/03-wyatt_02-v06-new-640w.mp4",
  ];
</script>

<div class="grid">
  {#each videos as videoUrl}
    <div class="video-container">
      <video src={videoUrl} muted autoplay loop playsinline></video>
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 15px; /* Adjust the gap between videos as needed */
  }

  .video-container {
    position: relative;
    width: 100%;
    padding-top: 177.78%; /* 9:16 aspect ratio */
    background-color: #000; /* Optional: Background color before the video loads */
  }

  .video-container video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures the video covers the container */
  }
</style>

<script>
  /** @type {{ id: number, size: "default" | "top" | "chat" | "column" }} */
  export let props;
</script>

<div class="g-paid">
  <div
    id="mid{props.id}"
    class="place-ad"
    data-position="mid{props.id}"
    data-size-key={props.size || "default"}
  />
</div>

<style>
  .g-paid {
    background-color: rgb(247, 247, 247);
    border-bottom: 1px solid rgb(243, 243, 243);
    border-top: 1px solid rgb(243, 243, 243);
    margin: 37px auto;
    padding-bottom: 30px;
    padding-top: 12px;
    text-align: center;
  }

  .g-paid::before {
    content: "Advertisement";
    color: #ccc;
    font-family: var(--g-franklin);
    font-size: 0.5625rem;
    font-weight: 300;
    letter-spacing: 0.05rem;
    line-height: 0.5625rem;
    margin-bottom: 9px;
    text-align: center;
    text-transform: uppercase;
    display: block;
  }
</style>

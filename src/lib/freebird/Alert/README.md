# Alert

This component is useful to display inline alerts in your piece or to refer to other links.

Use it like this:

```
alert: This is my alert
```

You can also extend it with standard Wrapper props and even add multi-line text.

## Props

| Property          | Type                          | Description                                                                                                                                                                                                        | Default                                 | Example                                        |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ---------------------------------------------- |
| **text**          | _[Required] String or Object_ | This is where the text of your alert goes. You can pass it inline like this `text: My text` or render multiple lines like this `[.+text]My text here[]`.                                                           | `empty`                                 | `This is an alert for an update to this story` |
| **type**          | _[Optional] String_           | This is the type of alert. By default it is empty and that renders a yellow box. You can set it to `refer` to render a gray box indicated for link referrals or to `warning` to render a red box (use carefully!). | `empty`                                 | `refer`                                        |
| **Wrapper props** | _[Optional]_                  | These are the <a target="_blank" href="../shared/Wrapper/">standard wrapper props</a>.                                                                                                                             | `marginInline: true, marginBlock: true` | `maxWidth: full`                               |

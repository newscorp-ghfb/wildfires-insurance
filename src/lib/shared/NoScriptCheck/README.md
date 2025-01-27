# No-Script Check

This component allows other components to provide a fallback `<noscript>` slot for environments without Javascript. This can be useful for components that depend on measuring the window width to select a specific media rendition. For instance, in the VideoPlayer component:

- Before the component’s `width` is available, a small rendition is picked — based on the 320 default target width (see `Media/utils.js`).
- If the user has Javascript disabled, the component will render inside the `<noscript>` tag. Even though the picked rendition may not be the width-appropriate one, the player will work normally.
- If the user has Javascript enabled, the component will then render after there is a `width` available and the width-appropriate rendition has been picked — preventing the browser from unnecessarily loading a small rendition before the width could be measured.

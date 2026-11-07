/// <reference types="astro/client" />

// StringTune's attribute API (string="progress", string-parallax="-0.1", …)
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    string?: string | boolean;
    [key: `string-${string}`]: string | boolean | undefined;
  }
}

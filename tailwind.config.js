/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        onboarding: "#002330",
        primary: {
          light: "#f2fafd",
          DEFAULT: "#0090c7",
          dark: "#005677",
          lighter: "#00ADEF",
        },
        accent: {
          light: "#fff9f1",
          DEFAULT: "#da7b07",
          dark: "#c24b02",
        },
        green: {
          light: "#e1eecf",
        },
        warning: {
          DEFAULT: "#d40505",
        },
      },
    },
    letterSpacing: {
      tightest: '-.075em',
      tighter: '-.05em',
      tight: '-.025em',
      normal: '0',
      wide: '.025em',
      wider: '.05em',
      // widest: '.1em',
      widest: '.25em',
    }
  },
  plugins: [require("daisyui")],
}


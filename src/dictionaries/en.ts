import type { Dictionary } from "./uk";

export const en: Dictionary = {
  locale: "en",

  header: {
    nav: [
      { label: "CRM tour", href: "#product" },
      { label: "Features", href: "#possibility" },
      { label: "How it works", href: "#how-it-works" },
      { label: "API", href: "#api" },
      { label: "FAQ", href: "#faq" },
    ],
    login: "Sign in",
    register: "Try for free",
  },

  hero: {
    titleLines: ["All your leads -", "in one place."],
    text: "Collect leads from your website and manage clients and requests in a single CRM.",
    button: "Start for free",
    consultButton: "Book a consultation",
    image: "/images/hero-en.png",
    imageAlt: "Lentra - all your leads in one place",
    underButtonLines: [
      "No developer? No problem.",
      "We will help you connect Lentra to your website and set up everything you need to start receiving leads.",
    ],
  },

  productTour: {
    eyebrow: "Inside Lentra",
    title: "Everything you need to manage leads, in one workspace",
    subtitle:
      "See how your team reviews new inquiries, schedules appointments, and follows each client from first request to outcome.",
    features: [
      {
        title: "Leads from every website, in one list",
        description:
          "Review activity across your websites and find the right lead without switching between inboxes, spreadsheets, and dashboards.",
        points: ["A separate source for each website", "Statuses and lead fields at a glance"],
        screenLabel: "Leads",
        imageAlt: "Website sources and lead activity in the Lentra dashboard",
        note: "Every lead in one workspace",
      },
      {
        title: "A complete history on every client card",
        description:
          "Contact details, requests, manager notes, and status changes stay together, so your team never loses the context.",
        points: ["Team notes on the client card", "A timeline of changes and statuses"],
        screenLabel: "Client card",
        imageAlt: "Client card with contact details, manager notes, and activity history",
        note: "The full interaction history, in view",
      },
      {
        title: "A calendar for appointments and leads",
        description:
          "Plan the week at a glance, review appointments, and keep track of each meeting's status.",
        points: ["Day, week, and month views", "Appointments from different websites"],
        screenLabel: "Calendar",
        imageAlt: "Weekly calendar of appointments received from websites",
        note: "Your work week at a glance",
      },
      {
        title: "Connect a website in a few steps",
        description:
          "Add a website and send leads to Lentra with a simple API request. Each source gets its own identifier.",
        points: ["Multiple websites in one account", "A ready-to-use integration example"],
        screenLabel: "Connect website",
        imageAlt: "Website connection screen and an example request for sending a lead to Lentra",
        note: "Your website connected to the CRM",
      },
    ],
    ctaText: "Want to see Lentra with your leads?",
    ctaButton: "Try for free",
  },

  inOnePlace: {
    title: "All your leads - in one place",
    subtitle:
      "Every lead lands in the CRM automatically, so you can quickly find the one you need and never lose a client.",
    cards: [
      {
        title: "Website leads",
        desc: "Forms from your website go straight into the CRM - not a single one gets lost.",
      },
      {
        title: "Comments and notes",
        desc: "Managers leave notes right on the client card - everything stays in plain sight.",
      },
      {
        title: "Reminders",
        desc: "Set a reminder for a client - at the right time it arrives as a message in the CRM and in Telegram.",
      },
      {
        title: "Client history",
        desc: "The full interaction history is stored on the client card: statuses, notes, and the date and time of every change.",
      },
    ],
    telegramTitle: "Telegram notifications - instantly",
    telegramText:
      "A new lead, an  status change, or a manager's reminder - everything arrives right in your chat.",
  },

  howItWorks: {
    title: "How it works",
    subtitle: "Three steps from your website to leads in Lentra.",
    steps: [
      {
        title: "Add a website to the CRM",
        description:
          "Create a website in your Lentra dashboard to give its leads a dedicated source.",
      },
      {
        title: "Get the API request for your developer",
        description:
          "Your dashboard provides the API request URL and a ready-to-use code example. Your developer just adapts the fields to your form — usually a 5–10 minute task.",
      },
      {
        title: "Connect your site or service",
        description:
          "Add an API request to your website or integrate another service, and new leads will flow into the CRM.",
      },
    ],
  },

  possibility: {
    title: "Features",
    items: [
      {
        label: "Leads",
        description: "Collect all leads from your websites in one place.",
      },
      {
        label: "Clients",
        description: "Manage client data and keep the interaction history.",
      },
      {
        label: "Analytics",
        description: "Track lead volume and how efficiently they are processed.",
      },
      {
        label: "Statuses",
        description: "Configure statuses to match your workflow.",
      },
      // {
      //   label: "Notifications",
      //   description: "Get notified about new leads and changes instantly.",
      // },
      {
        label: "API",
        description: "Integrate Lentra with any website or your own service.",
      },
    ],
  },

  oneApiForAll: {
    titleLines: ["One API for all", "your leads"],
    subtitle:
      "Send leads from your website to Lentra - from the backend or directly from the frontend.",
    docsLink: "View documentation",
    backendTitle: "cURL / HTTP request",
    frontendTitle: "JavaScript / fetch",
    backendCode: `POST /api/v1/leads
Authorization: Bearer sk_live_xxxxxxxx
Content-Type: application/json

{
  "name": "John",
  "phone": "+380671234567",
  "email": "john@example.com",
  "message": "I want to place an order"
}`,
    frontendCode: `const res = await fetch(
  "https://api.lentra.tech/v1/leads",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Site-ID": "site_abc123"
    },
    body: JSON.stringify({
      "name": "John",
      "phone": "+380671234567",
      "email": "john@example.com",
      "message": "I need a consultation"
    })
  }
);

`,
  },

  forAnyBusiness: {
    titleLines: ["For any business", "that receives leads online"],
    cards: [
      {
        title: "Online store",
        description: "Receive and track orders from your website.",
      },
      {
        title: "Service business",
        description: "Collect service requests and client inquiries.",
      },
      {
        title: "Agencies",
        description: "Manage leads from all your clients in one place.",
      },
      {
        title: "Custom websites",
        description: "Connect any website through the API.",
      },
    ],
  },

  faq: {
    title: "Frequently asked questions",
    questions: [
      {
        question: "What is this service?",
        answer:
          "Lentra is a CRM for leads. Every inquiry from your websites automatically lands in one system where you can see the client's history, statuses, and manager notes.",
      },
      {
        question: "How do I connect my website?",
        answer:
          "Create an API key in your dashboard and send leads to our endpoint - from your backend or directly from a form on your website. Setup takes a few minutes, and request examples are available in the documentation.",
      },
      {
        question: "Can I connect multiple websites?",
        answer:
          "Yes. Each website gets its own Site ID, so leads never get mixed up: you can filter them by source and manage all your projects in a single account.",
      },
      {
        question: "Do I need programming skills?",
        answer:
          "No. If you don't have a developer - we will help you connect Lentra to your website and set up lead collection. Just leave a consultation request below.",
      },
    ],
  },

  consultation: {
    title: "Book a consultation",
    subtitle:
      "Leave a request - we will show Lentra in action, help you connect your website, and set up lead collection.",
    benefits: [
      "A demo tailored to your business",
      "Help with connecting your website and the API",
      "A reply within one business day",
    ],
    nameLabel: "Name *",
    namePlaceholder: "John",
    nameError: "Please enter your name",
    phoneLabel: "Phone *",
    phonePlaceholder: "+1 555 123 4567",
    phoneError: "Please enter a valid phone number",
    emailLabel: "Email",
    emailPlaceholder: "john@example.com",
    emailError: "Please enter a valid email",
    siteLabel: "Website",
    sitePlaceholder: "example.com",
    messageLabel: "Comment",
    messagePlaceholder: "Briefly describe what kind of leads you need to collect",
    submit: "Book a consultation",
    submitting: "Sending…",
    note: "By clicking the button, you agree to the processing of your data.",
    success: "Thank you! We received your request and will get in touch soon.",
    error: "Failed to send the request. Please try again or email us.",
  },

  footer: {
    brandText:
      "A CRM for leads: collect inquiries from your website, manage clients, and never lose a single lead.",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "#possibility" },
          { label: "How it works", href: "#how-it-works" },
          { label: "API", href: "#api" },
        ],
      },
      // {
      //   title: "Support",
      //   links: [
      //     { label: "Documentation", href: "#api" },
      //     { label: "FAQ", href: "#faq" },
      //     { label: "Book a consultation", href: "#consultation" },
      //   ],
      // },
      // {
      //   title: "Company",
      //   links: [
      //     { label: "About Lentra", href: "#" },
      //     { label: "Terms of use", href: "#" },
      //     { label: "Privacy policy", href: "#" },
      //   ],
      // },
    ],
    rights: "All rights reserved.",
    consultationLink: "Book a consultation →",
  },
};

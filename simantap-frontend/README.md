# SIMANTAP - Safety Equipment Detection System

## 🎯 About SIMANTAP

**SIMANTAP** is an AI-powered solution for real-time detection of personal protective equipment (PPE) and workplace hazard identification. Using advanced Computer Vision and Machine Learning technologies, SIMANTAP helps organizations monitor and ensure workplace safety compliance automatically.

### Key Features
- 🎥 Real-time PPE detection via webcam (Start Detection button)
- 🚨 Automated safety alerts
- 📊 Dashboard & compliance analytics  
- 📸 Evidence capture & documentation
- 📈 Data-driven risk analysis

### 🎯 Model Performance (Safety Competition 2026)
| Model | Task | F1-Score | Inference Time |
|-------|------|----------|----------------|
| **YOLOv12 Medium** | PPE Detection | 95.88% | 17.3ms |
| **YOLOv12 Nano** | STF Detection | 78.53% | 11.3ms |

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

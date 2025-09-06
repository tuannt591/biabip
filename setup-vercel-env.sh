#!/bin/bash
# Script để set environment variables cho Vercel
# Chạy: chmod +x setup-vercel-env.sh && ./setup-vercel-env.sh

echo "Setting up Vercel environment variables..."

# Production environment
vercel env add NEXT_PUBLIC_USS_API_URL production
vercel env add NEXT_PUBLIC_API_KEY production
vercel env add NEXT_PUBLIC_PROJECT_ID production
vercel env add NEXT_PUBLIC_BIABIP_API_URL production

# Preview environment
vercel env add NEXT_PUBLIC_USS_API_URL preview
vercel env add NEXT_PUBLIC_API_KEY preview
vercel env add NEXT_PUBLIC_PROJECT_ID preview
vercel env add NEXT_PUBLIC_BIABIP_API_URL preview

# Development environment
vercel env add NEXT_PUBLIC_USS_API_URL development
vercel env add NEXT_PUBLIC_API_KEY development
vercel env add NEXT_PUBLIC_PROJECT_ID development
vercel env add NEXT_PUBLIC_BIABIP_API_URL development

echo "Environment variables setup completed!"
echo "Remember to redeploy your app for changes to take effect."

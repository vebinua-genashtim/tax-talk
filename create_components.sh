#!/bin/bash

# Create all component stub files
components=(
  "Navbar"
  "Hero"
  "VideoRow"
  "VideoCard"
  "MobileVideoCard"
  "ContinueWatchingRow"
  "LearningStats"
  "AuthModal"
  "VideoModal"
  "SubscriptionModal"
  "PaymentModal"
)

for comp in "${components[@]}"; do
  echo "export function ${comp}() { return <div>${comp}</div>; }" > "src/components/${comp}.tsx"
done

echo "Components created"

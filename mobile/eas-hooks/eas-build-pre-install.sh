#!/bin/bash
# Override npm ci with npm install --legacy-peer-deps
# This is needed because jest-expo has peer dep conflicts with React 19
echo "🔧 Overriding npm ci with npm install --legacy-peer-deps"
npm install --legacy-peer-deps
exit 0

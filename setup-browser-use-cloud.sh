#!/bin/bash

# Setup script for Browser Use Cloud integration
echo "🚀 Setting up Browser Use Cloud integration..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# LLM API Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=

# Browser Use Cloud API Key
BROWSER_USE_CLOUD_API_KEY=bu_oqHnm--Lp5brK0VLZflpq09M9nU33PLR1nbtA8Lp1gM

# Browser Automation Settings
USE_REAL_BROWSER_AUTOMATION=true
BROWSER_HEADLESS=true

# Development Settings
NODE_ENV=development
EOF
    echo "✅ .env.local created with your Browser Use Cloud API key"
else
    echo "📝 .env.local already exists - updating Browser Use Cloud API key..."
    
    # Update or add the Browser Use Cloud API key
    if grep -q "BROWSER_USE_CLOUD_API_KEY" .env.local; then
        sed -i '' 's/BROWSER_USE_CLOUD_API_KEY=.*/BROWSER_USE_CLOUD_API_KEY=bu_oqHnm--Lp5brK0VLZflpq09M9nU33PLR1nbtA8Lp1gM/' .env.local
    else
        echo "BROWSER_USE_CLOUD_API_KEY=bu_oqHnm--Lp5brK0VLZflpq09M9nU33PLR1nbtA8Lp1gM" >> .env.local
    fi
    
    # Enable real browser automation
    if grep -q "USE_REAL_BROWSER_AUTOMATION" .env.local; then
        sed -i '' 's/USE_REAL_BROWSER_AUTOMATION=.*/USE_REAL_BROWSER_AUTOMATION=true/' .env.local
    else
        echo "USE_REAL_BROWSER_AUTOMATION=true" >> .env.local
    fi
    
    echo "✅ Updated .env.local with Browser Use Cloud configuration"
fi

echo ""
echo "🎯 Browser Use Cloud Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Add your LLM API keys to .env.local (OpenAI, Anthropic, or Groq)"
echo "2. Restart the development server: npm run dev"
echo "3. Visit: http://localhost:3001/admin/settings"
echo "4. Test with: http://localhost:3001/r/tsk_daytona_coupon"
echo ""
echo "Your Browser Use Cloud API key is now configured! 🚀"

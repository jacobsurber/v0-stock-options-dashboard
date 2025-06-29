# SignalStack - AI-Powered Stock Analysis Platform

A sophisticated stock analysis platform powered by advanced AI models, providing multi-loop validation, real-time market data, and institutional-grade recommendations.

## 🚀 Features

- **Multi-Loop AI Validation**: Comprehensive criteria-driven analysis with multiple validation layers
- **Real-Time Market Data**: Live stock quotes, technical indicators, and government trading data
- **Day Trading Analysis**: Intraday technical analysis with precise entry/exit timing
- **International Coverage**: Support for global markets including ADRs and foreign stocks
- **Institutional Grade**: Hedge fund-level analysis with risk management and diversification
- **Multiple AI Models**: Support for GPT-4, GPT-4 Turbo, GPT-4o, and GPT-4o Mini

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **AI**: OpenAI GPT models with structured output
- **Database**: Supabase (PostgreSQL)
- **Caching**: Upstash Redis
- **Market Data**: Polygon.io, Alpha Vantage, Finnhub, Quiver Quant
- **UI Components**: shadcn/ui, Radix UI
- **Deployment**: Vercel

## 📋 Prerequisites

Before running this application, you'll need API keys for:

- **OpenAI** (Required) - For AI analysis
- **Polygon.io** (Recommended) - For real-time stock data
- **Alpha Vantage** (Optional) - For technical indicators
- **Finnhub** (Optional) - For company profiles
- **Quiver Quant** (Optional) - For government trading data
- **Supabase** (Optional) - For user data and analytics
- **Upstash Redis** (Optional) - For caching

## 🚀 Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/signalstack.git
   cd signalstack
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and add your API keys. At minimum, you need:
   \`\`\`
   OPENAI_API_KEY=your_openai_api_key_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Required Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key for AI analysis

### Optional Environment Variables

- `POLYGON_API_KEY` - For real-time market data
- `ALPHA_VANTAGE_API_KEY` - For technical indicators
- `FINNHUB_API_KEY` - For company profiles
- `QUIVER_QUANT_API_KEY` - For government trading data
- `SUPABASE_URL` & `SUPABASE_ANON_KEY` - For user data
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` - For caching

### API Key Setup

1. **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Polygon.io**: Sign up at [Polygon.io](https://polygon.io/) for market data
3. **Alpha Vantage**: Get a free key at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
4. **Finnhub**: Register at [Finnhub](https://finnhub.io/) for stock data
5. **Quiver Quant**: Sign up at [Quiver Quant](https://www.quiverquant.com/) for government trades

## 📊 Usage

### Basic Stock Analysis

1. Enter a stock ticker (e.g., AAPL, TSLA, NVDA)
2. Configure your analysis criteria:
   - Timeframe (1 day to 2 months)
   - Risk appetite (Conservative, Moderate, Aggressive)
   - Catalyst type (Technical, Earnings, Gov Trades, etc.)
   - Sector preference
   - Discovery method
3. Click "Generate Advanced Picks" for comprehensive analysis

### Day Trading Analysis

1. Navigate to the Day Trading Dashboard
2. Enter a stock ticker
3. Select strategy and timeframe
4. Get precise entry/exit times with technical analysis

### International Stocks

- Select "International Plays" as discovery method
- System will focus on ADRs and foreign companies
- Includes currency and international market considerations

## 🏗 Architecture

### Multi-Loop Validation Process

1. **Discovery**: AI identifies opportunities matching criteria
2. **Data Collection**: Gather live market data and technicals
3. **Criteria Validation**: Verify alignment with user requirements
4. **Price Analysis**: Calculate targets, stops, and risk/reward
5. **Final Validation**: Institutional-grade quality assessment
6. **Diversification**: Ensure portfolio balance and risk management

### Data Flow

\`\`\`
User Input → AI Discovery → Market Data APIs → Technical Analysis → 
Multi-Loop Validation → Quality Filtering → Diversified Results
\`\`\`

## 🔒 Security

- All API keys are stored in environment variables
- No sensitive data is committed to the repository
- Client-side code only receives processed results
- Rate limiting and error handling for all external APIs

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- `OPENAI_API_KEY`
- `POLYGON_API_KEY`
- `ALPHA_VANTAGE_API_KEY`
- `FINNHUB_API_KEY`
- `QUIVER_QUANT_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. It is not financial advice. Always do your own research and consult with qualified financial advisors before making investment decisions.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/signalstack/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- OpenAI for GPT models
- Vercel for hosting and deployment
- Polygon.io, Alpha Vantage, Finnhub for market data
- shadcn/ui for beautiful components
- The open-source community for amazing tools and libraries
